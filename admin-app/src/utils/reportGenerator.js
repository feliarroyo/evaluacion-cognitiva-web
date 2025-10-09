import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Genera y descarga un informe en PDF o TXT usando los datos precalculados
 * @param {Object} playthrough - Datos de la partida, ya con métricas y tablas calculadas
 * @param {"pdf" | "txt"} format - Formato de salida
 * @param {Object} patientInfo - Información del usuario {name, email}
 */

function mapIdsToNames(logContent) {
  const lines = logContent.split("\n");
  const objectLines = [];

  let inObjectSection = false;
  for (const line of lines) {
    if (line.startsWith("ID;OBJETO;TIPO;ID SPAWN;POSICION")) {
      inObjectSection = true;
      continue;
    }
    if (inObjectSection) {
      if (!line || line.startsWith("ID;SPAWN")) break;
      objectLines.push(line);
    }
  }

  const idToName = {};
  objectLines.forEach((line) => {
    const [id, nombre] = line.split(";");
    if (id && nombre) idToName[id.trim()] = nombre.trim();
  });

  return idToName;
}

// Obtención de las listas
// function getOME(memObjects = [], foundObjects = []) {
//   return memObjects.filter((obj) => foundObjects.includes(obj));
// }

// function getODE(decoyObjects = [], foundObjects = []) {
//   return decoyObjects.filter((obj) => foundObjects.includes(obj));
// }

// function getODNE(decoyObjects = [], foundObjects = []) {
//   return decoyObjects.filter((obj) => !foundObjects.includes(obj));
// }

// implementación de las tablas
function translate(value) {
  if (typeof value !== "string") return value;
  if (value.toUpperCase() === "YES") return "SI";
  if (value.toUpperCase() === "NO") return "NO";
  return value;
}

function parseMetricString(metricString, logContent) {
  if (!metricString) return [];

  const idToName = mapIdsToNames(logContent);

  return metricString
    .split(";")
    .map((registro) => {
      const match = registro.match(/^<(.+)>$/);
      if (!match) return null;

      return match[1].split(",").map((p) => {
        const val = p.trim();
        return idToName[val] || val;
      });
    })
    .filter(Boolean);
}

function addTableToPDF(doc, metricString, logContent, config, startY = 20) {
  const rows = parseMetricString(metricString, logContent).map((arr) =>
    config.order.map((i) => translate(arr[i]))
  );
  const rowHeight = 10;
  const headerHeight = 10;
  const minTableHeight = headerHeight + rowHeight;

  if (startY + minTableHeight > 280) {
    doc.addPage();
    startY = 20;
  }

  autoTable(doc, {
    startY,
    head: [config.headers],
    body: rows,
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 8, cellPadding: 2 },
  });

  return doc.lastAutoTable.finalY + 10;
}

function insertTablesInText(content, playthrough, logContent) {
  const tableMap = {
    "TABLA memView": {
      data: playthrough.memViewObjects,
      config: tableConfigs.memView,
    },
    "TABLA searchView": {
      data: playthrough.searchViewObject,
      config: tableConfigs.searchView,
    },
    "TABLA searchSelection": {
      data: playthrough.searchSelectionTimes,
      config: tableConfigs.searchSelection,
    },
    "TABLA searchChoiceInterval": {
      data: playthrough.searchChoiceInterval,
      config: tableConfigs.searchChoiceInterval,
    },
  };

  let finalContent = content;

  Object.entries(tableMap).forEach(([marker, { data, config }]) => {
    const rows = parseMetricString(data, logContent).map((arr) =>
      config.order.map((i) => translate(arr[i]))
    );

    const tableCSV = [config.headers.join(";")]
      .concat(rows.map((r) => r.join(";")))
      .join("\n");

    finalContent = finalContent.replace(marker, tableCSV);
  });

  return finalContent;
}

const tableConfigs = {
  memView: {
    title: "Tiempo en fase de memorización",
    headers: ["Objeto", "Tiempo de observación", "Inicio", "Fin"],
    order: [0, 3, 1, 2],
  },
  searchView: {
    title: "Tiempo en fase de búsqueda",
    headers: ["Objeto", "Tiempo de observación", "Inicio", "Fin", "Elegido"],
    order: [0, 3, 1, 2, 4],
  },
  searchSelection: {
    title: "Tiempo desde inicio búsqueda hasta elección",
    headers: [
      "Objeto",
      "Tiempo transcurrido",
      "Inicio de etapa",
      "Tiempo de elección",
    ],
    order: [0, 3, 1, 2],
  },
  searchChoiceInterval: {
    title: "Intervalo entre observación de objetos",
    headers: [
      "Objeto previo",
      "Tiempo",
      "Objeto actual",
      "Tiempo",
      "Tiempo transcurrido",
    ],
    order: [0, 1, 2, 3, 4],
  },
};

// Generación del informe
export function generateReport(playthrough, format = "pdf", patientInfo = {}) {
  if (!playthrough) return;

  const { name = "", email = "" } = patientInfo;
  const safeName = name.replace(/\s+/g, "");

  let formattedDate = playthrough.date || "";
  if (formattedDate) {
    const parts = formattedDate.split("-");
    if (parts.length === 3)
      formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  // Contenido textual del informe
  const content = `
  INFORME

  A. FECHA Y HORA
     
    a) Fecha: ${formattedDate}
    b) Hora: ${playthrough.time}
  
  B. USUARIO
    
    a) Nombre y apellido: ${name}
    b) Email: ${email}

  C. PARÁMETROS DEL JUEGO

    a) Nivel del juego: ${playthrough.level}

    b) Objetos a memorizar

          Cantidad de objetos: ${playthrough.memObjects.length}

          Lista de objetos: 
          ${(playthrough.memObjects ?? []).join("\n          ")}

    c) Objetos distractores

          Cantidad de objetos: ${playthrough.decoyObjects.length}

          Lista de objetos: 
          ${(playthrough.decoyObjects ?? []).join("\n          ")}
    
    d) Tiempo disponible para la etapa de memorización: ${playthrough.memTime}s

    e) Tiempo disponible para la etapa de evaluación: ${
      playthrough.availableSearchTime
    }s
  
  D. RESULTADOS - Identificación y elección de objetos

    a) Objetos a memorizar elegidos por el usuario (OME)

          Cantidad de objetos: ${playthrough.truePositive}

          Lista de objetos: 
          ${(playthrough.memChosen ?? []).join("\n          ")}
    
    b) Objetos distractores elegidos por el usuario (ODE)

          Cantidad de objetos: ${playthrough.falsePositive}

          Lista de objetos: 
          ${(playthrough.decoyChosen ?? []).join("\n          ")}
    
    c) Objetos a memorizar no elegidos por el usuario (OMNE):

          Cantidad de objetos: ${playthrough.falseNegative}

          Lista de objetos: 
          ${(playthrough.memNotChosen ?? []).join("\n          ")}
    
    d) Objetos distractores no elegidos por el usuario (ODNE):

          Cantidad de objetos: ${playthrough.trueNegative}

          Lista de objetos: 
          ${(playthrough.decoyNotChosen ?? []).join("\n          ")}
    
    e) Accuracy

        Interpretación: Porcentaje de objetos identificados por el usuario, en relación al total de objetos (objetos a memorizar más objetos distractores).

        Cálculo: (OME + ODNE) / (OME + ODE + OMNE + ODNE) * 100

        Valor obtenido: ${(playthrough.accuracy * 100).toFixed(2)}%
    
    f) Precisión

        Interpretación: Porcentaje de objetos a memorizar elegidos por el usuario, en relación al total de objetos elegidos.

        Cálculo: OME / (OME + ODE) * 100

        Valor obtenido: ${(playthrough.precision * 100).toFixed(2)}%
    
    g) Recall

        Interpretación: Porcentaje de objetos a memorizar elegidos por el usuario, en relación al total de objetos a memorizar.

        Cálculo: OME / (OME + OMNE) * 100

        Valor obtenido: ${(playthrough.recall * 100).toFixed(2)}%
    
    h) Tasa de error

        Interpretación: Porcentaje de objetos distractores elegidos por el usuario, en relación al total de objetos elegidos.

        Cálculo: ODE / (OME + ODE) * 100

        Valor obtenido: ${(playthrough.errorRate * 100).toFixed(2)}%

    i) Índice de omisión

        Interpretación: Porcentaje de objetos a memorizar que no fueron elegidos por el usuario, en relación al total de objetos a memorizar.

        Cálculo: OMNE / (OME + OMNE) * 100

        Valor obtenido: ${(playthrough.omissionIndex * 100).toFixed(2)}%

  E. RESULTADOS - Tiempos utilizados

    a) Tiempos utilizados por el usuario, durante la etapa de memorización, para la observación detallada de los objetos:
    
TABLA memView

    b) Tiempo transcurrido entre la etapa de memorización y la etapa de evaluación: ${
      playthrough.intermediateTime
    }s

    c) Tiempo utilizado por el usuario durante la etapa de evaluación (TUEE): ${
      playthrough.searchTime
    }s

    d) Porcentaje de tiempo utilizado por el usuario:

        Interpretación: Porcentaje de tiempo utilizado por el usuario durante la etapa de evaluación, en relación al tiempo disponible para la etapa de evaluación (TDEE).

        Cálculo: TUEE / TDEE * 100

        Valor obtenido: ${(playthrough.temporalEfficiency * 100).toFixed(2)}%
    
    e) Tiempos utilizados por el usuario, durante la etapa de evaluación, para la observación detallada de los objetos:
    
TABLA searchView
    
    f) Tiempos transcurridos desde que el usuario inició la etapa de evaluación hasta las elecciones de los objetos:
    
TABLA searchSelection
    
    g) Tiempos transcurridos, durante la etapa de evaluación, entre elecciones consecutivas de objetos:
    
TABLA searchChoiceInterval
  `;

  if (format === "txt") {
    const finalContent = insertTablesInText(
      content,
      playthrough,
      playthrough.logging
    );
    const blob = new Blob([finalContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `informe_${safeName}_${formattedDate}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  if (format === "pdf") {
    const doc = new jsPDF();
    let y = 10;

    doc.setFontSize(10);
    const lines = content.split("\n");

    let inList = false;

    const indentNormal = 20;
    const indentList = 30;

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith("TABLA ")) {
        const key = trimmed.replace("TABLA ", "");
        let tableData = [];
        let tableConfig;
        switch (key) {
          case "memView":
            tableData = playthrough.memViewObjects;
            tableConfig = tableConfigs.memView;
            break;
          case "searchView":
            tableData = playthrough.searchViewObject;
            tableConfig = tableConfigs.searchView;
            break;
          case "searchSelection":
            tableData = playthrough.searchSelectionTimes;
            tableConfig = tableConfigs.searchSelection;
            break;
          case "searchChoiceInterval":
            tableData = playthrough.searchChoiceInterval;
            tableConfig = tableConfigs.searchChoiceInterval;
            break;
        }
        if (tableData && tableConfig) {
          y = addTableToPDF(
            doc,
            tableData,
            playthrough.logging,
            tableConfig,
            y
          );
        }
      } else {
        if (trimmed === "") {
          y += 5;
          inList = false;
          continue;
        }

        const boldKeywords = ["A.", "B.", "C.", "D.", "E.", "INFORME"];
        const isBold = boldKeywords.some((kw) => trimmed.startsWith(kw));
        doc.setFont("helvetica", isBold ? "bold" : "normal");

        let x = indentNormal;
        if (trimmed === "INFORME") {
          const pageWidth = doc.internal.pageSize.width;
          const textWidth = doc.getTextWidth(trimmed);
          x = (pageWidth - textWidth) / 2;
        }

        if (trimmed.startsWith("Lista de objetos:")) {
          inList = true;

          if (y > 280) {
            doc.addPage();
            y = 20;
          }
          doc.text(trimmed, indentList, y);
          y += 6;

          continue;
        }

        const wrappedLines = doc.splitTextToSize(line, 180);

        for (let wLine of wrappedLines) {
          if (y > 280) {
            doc.addPage();
            y = 20;
          }

          let x = indentNormal;
          let textToPrint = wLine;

          if (inList) {
            x = indentList;
            textToPrint = "• " + wLine.trim();
          }

          doc.text(textToPrint, x, y);
          y += 6;
        }
      }
    }

    doc.save(`informe_${safeName}_${formattedDate}.pdf`);
  }
}
