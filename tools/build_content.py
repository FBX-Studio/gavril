import json
import re
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path


def read_docx_paragraphs(docx_path: Path) -> list[str]:
    with zipfile.ZipFile(docx_path, "r") as z:
        xml_content = z.read("word/document.xml")
    tree = ET.fromstring(xml_content)
    ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}

    paragraphs = []
    for p in tree.findall(".//w:p", ns):
        texts = p.findall(".//w:t", ns)
        para = "".join(t.text for t in texts if t.text)
        para = para.strip()
        if para:
            paragraphs.append(para)
    return paragraphs


def read_pdf_text(pdf_path: Path) -> str:
    # PyMuPDF imports as `pymupdf` in recent versions
    import pymupdf  # type: ignore

    doc = pymupdf.open(str(pdf_path))
    chunks: list[str] = []
    for page in doc:
        chunks.append(page.get_text())
    text = "\n".join(chunks)
    # normalize whitespace + remove zero-width spaces
    text = text.replace("\u200b", "").replace("\ufeff", "")
    return text


def parse_questions(docx_paragraphs: list[str]) -> dict[int, str]:
    questions: dict[int, str] = {}
    for line in docx_paragraphs:
        m = re.match(r"^(\d+)\.\s*(.+)$", line)
        if not m:
            continue
        qn = int(m.group(1))
        qtext = m.group(2).strip()
        questions[qn] = qtext
    return questions


def split_numbered_sections(text: str) -> dict[int, str]:
    # Find starts of sections like "1." at line starts (or after newline)
    # Make sure we don't split on things like URLs with ".".
    pattern = re.compile(r"(?:^|\n)(?=(\d{1,3})\.)")
    parts = pattern.split(text)

    # parts: [preamble, num1, body1, num2, body2, ...]
    out: dict[int, str] = {}
    if len(parts) < 3:
        return out

    i = 1
    while i + 1 < len(parts):
        try:
            num = int(parts[i])
        except ValueError:
            i += 2
            continue
        body = parts[i + 1].strip()
        # Trim obvious trailing artifacts
        body = re.sub(r"\n{3,}", "\n\n", body)
        out[num] = body
        i += 2
    return out


def merge_answers(primary: dict[int, str], secondary: dict[int, str]) -> dict[int, str]:
    merged = dict(primary)
    for k, v in secondary.items():
        if k not in merged:
            merged[k] = v
            continue
        # If secondary has unique lines not in primary, append as "Дополнение"
        pv = merged[k]
        if v and v.strip() and v.strip() not in pv:
            merged[k] = pv.rstrip() + "\n\nДополнение:\n" + v.strip()
    return merged


def build_levels() -> list[dict]:
    # Keep mapping simple and aligned to your provided video groups.
    return [
        {
            "id": "lvl1",
            "title": "Уровень 1: Растр и вектор",
            "goal": "Понять базовые понятия и отличия растра/вектора.",
            "questions": [1, 2, 3, 4, 5],
            "videos": [
                {
                    "title": "Основы графики (Растр и Вектор)",
                    "url": "https://www.youtube.com/watch?v=c1ShRJ07vhc",
                },
                {
                    "title": "Основы графики (Растр и Вектор)",
                    "url": "https://www.youtube.com/watch?v=S9Nuvi9v9wY",
                },
            ],
            "practice": ["raster-vector"],
        },
        {
            "id": "lvl2",
            "title": "Уровень 2: Цвет и модели",
            "goal": "Разобраться в H/S/V, RGB/CMY/CMYK и восприятии цвета.",
            "questions": [6, 7, 10, 11, 12, 13, 14, 15],
            "videos": [
                {
                    "title": "Цветовые модели (RGB, CMYK, HSB)",
                    "url": "https://www.youtube.com/watch?v=GN1RZkViEAE",
                },
                {
                    "title": "Цветовые модели (RGB, CMYK, HSB)",
                    "url": "https://www.youtube.com/watch?v=1pjtRkTORcA",
                },
            ],
            "practice": ["color-models"],
        },
        {
            "id": "lvl3",
            "title": "Уровень 3: Закраска и освещение",
            "goal": "Понять flat/Gouraud/Phong и разницу интерполяций.",
            "questions": [16, 17, 18],
            "videos": [
                {
                    "title": "Алгоритмы освещения (Гуро и Фонг)",
                    "url": "https://www.youtube.com/watch?v=j8BF1fjm5_Y",
                },
                {
                    "title": "Алгоритмы освещения (Гуро и Фонг)",
                    "url": "https://www.youtube.com/watch?v=8VMu-YWZRG4",
                },
            ],
            "practice": ["shading"],
        },
        {
            "id": "lvl4",
            "title": "Уровень 4: Растеризация и сглаживание",
            "goal": "Освоить Брезенхейма (линия/окружность), заливку, антиалиасинг.",
            "questions": [19, 20, 21, 23, 24, 25],
            "videos": [
                {
                    "title": "Алгоритмы Брезенхема (Линии и Окружности)",
                    "url": "https://www.youtube.com/watch?v=wJki7vbaVuc",
                },
                {
                    "title": "Алгоритмы Брезенхема (Линии и Окружности)",
                    "url": "https://www.youtube.com/watch?v=jUKHYIBWMd0",
                },
                {
                    "title": "Алгоритмы Брезенхема (Линии и Окружности)",
                    "url": "https://www.youtube.com/watch?v=Sy213pxWfyI",
                },
            ],
            "practice": ["bresenham"],
        },
        {
            "id": "lvl5",
            "title": "Уровень 5: Геометрические преобразования и отсечение",
            "goal": "Понять 2D-преобразования, поворот/масштаб, отсечение многоугольников.",
            "questions": [22, 27, 28, 30, 31, 32, 33, 34],
            "videos": [
                {
                    "title": "Отсечение (Сазерленд-Ходгман) и Геометрия",
                    "url": "https://www.youtube.com/watch?v=CMWlL9_-rJw",
                },
                {
                    "title": "Отсечение (Сазерленд-Ходгман) и Геометрия",
                    "url": "https://www.youtube.com/watch?v=clCzzMiQPc8",
                },
            ],
            "practice": ["clipping"],
        },
        {
            "id": "lvl6",
            "title": "Уровень 6: Обработка изображений + сжатие + стего",
            "goal": "Понять фильтры/сжатие и базовую стеганографию/ЦВЗ.",
            "questions": [26, 29, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57],
            "videos": [
                {
                    "title": "Стеганография и водяные знаки (ЦВЗ)",
                    "url": "https://www.youtube.com/watch?v=QH2J_YwOT0E",
                },
                {
                    "title": "Стеганография и водяные знаки (ЦВЗ)",
                    "url": "https://www.youtube.com/watch?v=LFyXLTl6onQ",
                },
                {
                    "title": "Стеганография и водяные знаки (ЦВЗ)",
                    "url": "https://www.youtube.com/watch?v=mQWgCY7cdzk",
                },
                {
                    "title": "Стеганография и водяные знаки (ЦВЗ)",
                    "url": "https://www.youtube.com/watch?v=QlL82mOIsvM",
                },
            ],
            "practice": ["filters", "lsb-stego"],
        },
    ]


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    docx_path = root / "vopros.docx"
    pdf1_path = root / "otvet1.pdf"
    pdf2_path = root / "otvet2.pdf"
    out_path = root / "kg-game" / "src" / "generated" / "content.json"

    docx_paras = read_docx_paragraphs(docx_path)
    questions = parse_questions(docx_paras)

    pdf1_text = read_pdf_text(pdf1_path)
    pdf2_text = read_pdf_text(pdf2_path)

    a1 = split_numbered_sections(pdf1_text)
    a2 = split_numbered_sections(pdf2_text)

    answers = merge_answers(a1, a2)

    # Basic link supplements from your question list
    extra_links = {
        7: [
            "https://portal.tpu.ru/SHARED/d/DAVYDOVA/academic/cvetoved/Tab4/tema_2.pdf",
            "http://mar.ugatu.su/data/uploads/CG/lec/1.pdf",
        ],
        18: [
            "https://studizba.com/lectures/informatika-i-programmirovanie/vvedenie-v-kompyuternuyu-grafiku/3629-metody-guro-i-fonga-dlya-zakrashivaniya.html",
            "https://studfile.net/preview/7766037/page:13/",
        ],
        22: [
            "https://program.rin.ru/razdel/html/906.html",
        ],
        23: [
            "https://www.bsu.by/upload/page/353633.pdf",
        ],
    }

    items = []
    for i in range(1, 58):
        q = questions.get(i, f"Вопрос {i}")
        a = answers.get(i, "")
        items.append(
            {
                "id": i,
                "question": q,
                "answer": a,
                "links": extra_links.get(i, []),
            }
        )

    data = {
        "meta": {
            "generatedFrom": [str(docx_path.name), str(pdf1_path.name), str(pdf2_path.name)],
        },
        "levels": build_levels(),
        "qa": items,
    }

    out_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {out_path}")


if __name__ == "__main__":
    main()
