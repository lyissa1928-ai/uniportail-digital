const ExcelJS = require("exceljs");

async function main() {
  const file =
    process.argv[2];

  const suffix =
    process.argv[3];

  if (!file || !suffix) {
    throw new Error(
      "Arguments absents"
    );
  }

  const workbook =
    new ExcelJS.Workbook();

  const sheet =
    workbook.addWorksheet(
      "Etudiants"
    );

  sheet.columns = [
    {
      header: "matricule",
      key: "matricule",
      width: 25
    },
    {
      header: "nom",
      key: "nom",
      width: 25
    },
    {
      header: "prenom",
      key: "prenom",
      width: 25
    },
    {
      header: "date_naissance",
      key: "date_naissance",
      width: 18
    },
    {
      header: "email",
      key: "email",
      width: 35
    },
    {
      header: "telephone",
      key: "telephone",
      width: 20
    }
  ];

  sheet.addRow({
    matricule:
      "TEST-LOT-A-" + suffix,

    nom:
      "DIOP",

    prenom:
      "TEST A",

    date_naissance:
      "2001-01-10",

    email:
      "test.lot.a." +
      suffix +
      "@example.com",

    telephone:
      "770000002"
  });

  sheet.addRow({
    matricule:
      "TEST-LOT-B-" + suffix,

    nom:
      "NDIAYE",

    prenom:
      "TEST B",

    date_naissance:
      "2002-02-20",

    email:
      "test.lot.b." +
      suffix +
      "@example.com",

    telephone:
      "770000003"
  });

  await workbook.xlsx.writeFile(
    file
  );

  console.log(
    "[OK] Fichier import créé"
  );
}

main().catch((error) => {
  console.error(
    "[FAIL]",
    error.message
  );

  process.exit(1);
});
