const ExcelJS = require("exceljs");

async function main() {
  const file = process.argv[2];

  if (!file) {
    throw new Error("Chemin XLSX absent");
  }

  const workbook =
    new ExcelJS.Workbook();

  await workbook.xlsx.readFile(file);

  console.log(
    "[OK] Feuilles : " +
    workbook.worksheets
      .map((sheet) => sheet.name)
      .join(", ")
  );

  const sheet =
    workbook.getWorksheet("Etudiants");

  if (!sheet) {
    throw new Error(
      "Feuille Etudiants absente"
    );
  }

  const headers =
    sheet
      .getRow(1)
      .values
      .slice(1)
      .map((value) =>
        String(value ?? "").trim()
      );

  console.log(
    "[OK] Colonnes : " +
    headers.join(", ")
  );

  const required = [
    "matricule",
    "nom",
    "prenom",
    "date_naissance",
    "email",
    "telephone"
  ];

  for (const column of required) {

    if (!headers.includes(column)) {

      throw new Error(
        "Colonne absente : " +
        column
      );
    }
  }

  console.log(
    "[OK] Structure XLSX valide"
  );
}

main().catch((error) => {
  console.error(
    "[FAIL]",
    error.message
  );

  process.exit(1);
});
