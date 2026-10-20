function winAnsiBytes(value) {
  const specialCharacters = {
    "€": 0x80,
    "‚": 0x82,
    "ƒ": 0x83,
    "„": 0x84,
    "…": 0x85,
    "†": 0x86,
    "‡": 0x87,
    "ˆ": 0x88,
    "‰": 0x89,
    "Š": 0x8a,
    "‹": 0x8b,
    "Œ": 0x8c,
    "Ž": 0x8e,
    "‘": 0x91,
    "’": 0x92,
    "“": 0x93,
    "”": 0x94,
    "•": 0x95,
    "–": 0x96,
    "—": 0x97,
    "˜": 0x98,
    "™": 0x99,
    "š": 0x9a,
    "›": 0x9b,
    "œ": 0x9c,
    "ž": 0x9e,
    "Ÿ": 0x9f,
  };

  return [...String(value)].map((character) => {
    const code = character.codePointAt(0);
    if (code >= 0x20 && code <= 0x7e) return code;
    if (code >= 0xa0 && code <= 0xff) return code;
    return specialCharacters[character] || 0x3f;
  });
}

function toPdfHex(value) {
  return winAnsiBytes(value)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function wrapLine(value, maxLength = 92) {
  const words = String(value).split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";

  words.forEach((word) => {
    if (!current && word.length > maxLength) {
      for (let index = 0; index < word.length; index += maxLength) {
        lines.push(word.slice(index, index + maxLength));
      }
      return;
    }

    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });

  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function createPageContent(title, subtitle, lines) {
  const commands = [
    "BT",
    `/F2 17 Tf 1 0 0 1 48 792 Tm <${toPdfHex(title)}> Tj`,
    `/F1 9 Tf 1 0 0 1 48 772 Tm <${toPdfHex(subtitle)}> Tj`,
  ];

  let y = 744;
  lines.forEach((line) => {
    commands.push(`/F1 10 Tf 1 0 0 1 48 ${y} Tm <${toPdfHex(line)}> Tj`);
    y -= 14;
  });
  commands.push("ET");
  return commands.join("\n");
}

export function downloadPdf({ filename, title, subtitle, lines }) {
  const wrappedLines = lines.flatMap((line) => wrapLine(line));
  const linesPerPage = 48;
  const pages = [];

  for (let index = 0; index < wrappedLines.length; index += linesPerPage) {
    pages.push(wrappedLines.slice(index, index + linesPerPage));
  }
  if (pages.length === 0) pages.push(["No hay información disponible."]);

  const lastObjectId = 4 + pages.length * 2;
  const objects = new Array(lastObjectId + 1);
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${pages.map((_, index) => `${5 + index * 2} 0 R`).join(" ")}] /Count ${pages.length} >>`;
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
  objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";

  pages.forEach((pageLines, index) => {
    const pageId = 5 + index * 2;
    const contentId = pageId + 1;
    const pageTitle = index === 0 ? title : `${title} (continuación)`;
    const content = createPageContent(pageTitle, subtitle, pageLines);

    objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`;
    objects[contentId] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
  });

  let pdf = "%PDF-1.4\n";
  const offsets = new Array(lastObjectId + 1).fill(0);
  for (let id = 1; id <= lastObjectId; id += 1) {
    offsets[id] = pdf.length;
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${lastObjectId + 1}\n0000000000 65535 f \n`;
  for (let id = 1; id <= lastObjectId; id += 1) {
    pdf += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${lastObjectId + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
