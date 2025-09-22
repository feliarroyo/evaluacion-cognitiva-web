import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Genera y descarga un informe en PDF o TXT usando los datos precalculados
 * @param {Object} playthrough - Datos de la partida, ya con métricas y tablas calculadas
 * @param {"pdf" | "txt"} format - Formato de salida
 * @param {Object} patientInfo - Información del paciente {name, email}
 */

function mapIdsToNames(logContent) {
  const lines = logContent.split("\n");
  const objectLines = [];

  // Buscar la sección de objetos (asumimos que empieza con 'ID;OBJETO;TIPO;ID SPAWN;POSICION')
  let inObjectSection = false;
  for (const line of lines) {
    if (line.startsWith("ID;OBJETO;TIPO;ID SPAWN;POSICION")) {
      inObjectSection = true;
      continue; // saltamos el encabezado
    }
    if (inObjectSection) {
      if (!line || line.startsWith("ID;SPAWN")) break; // terminó la sección
      objectLines.push(line);
    }
  }

  // Creamos el diccionario { id: nombre }
  const idToName = {};
  objectLines.forEach((line) => {
    const [id, nombre] = line.split(";");
    if (id && nombre) idToName[id.trim()] = nombre.trim();
  });

  return idToName;
}

function replaceIdsWithNames(metricString, logContent) {
  if (!metricString) return "";

  const idToName = mapIdsToNames(logContent);

  // Separamos los registros por ';'
  const registros = metricString.split(";");

  const registrosConNombres = registros.map((registro) => {
    // Cada registro tiene formato: <id,...>
    const match = registro.match(/^<(.+)>$/);
    if (!match) return registro;

    const partes = match[1].split(",").map((p) => p.trim());

    // Reemplazamos cada parte que sea número y exista en idToName
    const partesConNombres = partes.map((p) => {
      return idToName[p] || p; // si no existe, dejamos el ID
    });

    return `<${partesConNombres.join(",")}>`;
  });

  return registrosConNombres.join(";");
}

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
    Paciente: ${name}
    Email: ${email}

    Fecha: ${formattedDate} (${playthrough.time})
    Nivel: ${playthrough.level}

    Tiempos:
    Tiempo disponible para la memorización de objetos: ${playthrough.memTime}s
    Tiempo disponible para la identificación de objetos: ${
      playthrough.availableSearchTime
    }s 
    Tiempo utilizado para la identificación de objetos: ${
      playthrough.searchTime
    }s
    Tiempo transcurrido entre la etapa de memorización y la etapa de identificación de objetos: ${
      playthrough.intermediateTime
    }s

    Objetos a memorizar: ${playthrough.memObjects?.join(", ")}.
    Objetos distractores: ${playthrough.decoyObjects?.join(", ")}.
    Objetos elegidos por el usuario: ${playthrough.foundObjects?.join(", ")}.
    Objetos a memorizar no elegidos por el usuario: ${playthrough.memNotChosen?.join(
      ", "
    )}.

    Cantidad de objetos a memorizar que fueron elegidos: ${
      playthrough.truePositive
    }
    Cantidad de objetos a memorizar que no fueron elegidos: ${
      playthrough.falseNegative
    }
    Cantidad de objetos distractores que fueron elegidos: ${
      playthrough.falsePositive
    }
    Cantidad de objetos distractores que no fueron elegidos: ${
      playthrough.trueNegative
    }

    Porcentaje de objetos identificados correctamente en relación al total de objetos (objetos a memorizar y distractores): ${
      playthrough.accuracy
    }%
    Porcentaje de objetos elegidos correctamente en relación al total de objetos elegidos (tanto correctos como incorrectos): ${
      playthrough.precision
    }%
    Porcentaje de objetos elegidos correctamente en relación al total de objetos que debían ser elegidos (objetos a memorizar): ${
      playthrough.recall
    }%
    Porcentaje de objetos que el usuario no pudo identificar, en relación al total de objetos a identificar (objetos a memorizar): ${
      playthrough.omissionIndex
    }%
    Porcentaje de objetos incorrectamente identificados sobre el total de objetos a identificar: ${
      playthrough.errorRate
    }%
    Porcentaje del tiempo disponible para la identificación de objetos que el usuario utilizó efectivamente: ${
      playthrough.temporalEfficiency
    }%

    Medición del tiempo que ocupa el usuario en mirar cada objeto detalladamente en la fase de memorización: ${replaceIdsWithNames(
      playthrough.memViewObjects,
      playthrough.logging
    )}

    Medición del tiempo que ocupa el usuario en mirar cada objeto detalladamente en la fase de búsqueda detallando si el objeto termina siendo elegido o no: ${replaceIdsWithNames(
      playthrough.searchViewObject,
      playthrough.logging
    )}

    Medición del tiempo que ocupa el usuario desde que inicia la fase de búsqueda hasta que agarra cada objeto: ${replaceIdsWithNames(
      playthrough.searchSelectionTimes,
      playthrough.logging
    )}
    
    Medición del tiempo que ocupa el usuario en mirar cada objeto detalladamente desde que dejo el objeto anterior hasta que miro detalladamente el objeto actual: ${replaceIdsWithNames(
      playthrough.searchChoiceInterval,
      playthrough.logging
    )}
  `;

  if (format === "txt") {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
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
    const lineHeight = 7;
    doc.setFontSize(10);

    const lines = doc.splitTextToSize(content, 190);
    lines.forEach((line) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 10, y);
      y += lineHeight;
    });

    doc.save(`informe_${safeName}_${formattedDate}.pdf`);
  }
}
