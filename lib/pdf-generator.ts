import jsPDF from "jspdf"
import QRCode from "qrcode"

interface StudentData {
  fullName: string
  birthDate: string
  schoolName: string
  gradeLevel: string
  course: string
  registrationNumber: string
  studentIdNumber: string
  schoolAddress: string
  contactInfo: string
  photo: File | null
  city: string
  transportType: string
  cpf?: string
  rg?: string
}

export async function generateStudentIdPDF(studentData: StudentData): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: "landscape", // Changed to landscape for better layout
    unit: "mm",
    format: [85, 55], // Exact ID card dimensions
  })

  const cardColors = getTransportColors(studentData.transportType, studentData.city)

  const margin = 1.5
  const contentWidth = 85 - margin * 2 // 82mm
  const contentHeight = 55 - margin * 2 // 52mm

  // Set background color with margins - white for Silva&Cunha, light green for others
  if (
    studentData.transportType &&
    studentData.transportType.toLowerCase().includes("silva") &&
    studentData.transportType.toLowerCase().includes("cunha")
  ) {
    pdf.setFillColor(255, 255, 255) // Pure white background for Silva&Cunha
  } else {
    pdf.setFillColor(240, 253, 244) // Light green background for others
  }
  pdf.rect(margin, margin, contentWidth, contentHeight, "F")

  // Header bar with margins
  pdf.setFillColor(cardColors.primary.r, cardColors.primary.g, cardColors.primary.b)
  pdf.rect(margin, margin, contentWidth, 10, "F")

  try {
    pdf.addImage(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-6aosc8MraHmwqlfiecOwPM2PFuOojY.png",
      "PNG",
      margin + 1,
      margin + 0.5,
      10,
      9,
    )
  } catch (error) {
    console.error("Error adding coat of arms:", error)
    pdf.setFillColor(255, 255, 255)
    pdf.circle(margin + 6, margin + 5, 3, "F")
  }

  // Header text with margin adjustments
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(8)
  pdf.setFont("helvetica", "bold")
  pdf.text("PREFEITURA MUNICIPAL DE NOVA PONTE", margin + 13, margin + 3.5)
  pdf.setFontSize(6)
  pdf.text("MINAS GERAIS", margin + 13, margin + 6.5)
  pdf.setFontSize(5)
  pdf.setFont("helvetica", "normal")
  pdf.text("CARTEIRA DE ESTUDANTE", margin + 13, margin + 9)

  if (studentData.photo) {
    try {
      const photoDataUrl = await fileToDataUrl(studentData.photo)
      pdf.addImage(photoDataUrl, "JPEG", margin + 1.5, margin + 12, 14, 18)
    } catch (error) {
      console.error("Error adding photo:", error)
      // Photo placeholder
      pdf.setFillColor(200, 200, 200)
      pdf.rect(margin + 1.5, margin + 12, 14, 18, "F")
      pdf.setTextColor(100, 100, 100)
      pdf.setFontSize(5)
      pdf.text("FOTO", margin + 7, margin + 22)
    }
  } else {
    // Photo placeholder
    pdf.setFillColor(200, 200, 200)
    pdf.rect(margin + 1.5, margin + 12, 14, 18, "F")
    pdf.setTextColor(100, 100, 100)
    pdf.setFontSize(5)
    pdf.text("FOTO", margin + 7, margin + 22)
  }

  try {
    const qrCodeData = `NOVA_PONTE_STUDENT_ID:${studentData.studentIdNumber}:${studentData.fullName}:${studentData.schoolName}`
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeData, {
      width: 80,
      margin: 1,
      color: {
        dark: cardColors.hex,
        light: "#ffffff",
      },
    })
    pdf.addImage(qrCodeDataUrl, "PNG", margin + 66, margin + 12, 12, 12)
  } catch (error) {
    console.error("Error generating QR code:", error)
    // QR code placeholder
    pdf.setFillColor(200, 200, 200)
    pdf.rect(margin + 66, margin + 12, 12, 12, "F")
    pdf.setTextColor(100, 100, 100)
    pdf.setFontSize(4)
    pdf.text("QR", margin + 71, margin + 19)
  }

  pdf.setTextColor(55, 65, 81)
  pdf.setFontSize(4.5)
  pdf.setFont("helvetica", "bold")
  pdf.text("DOC. Nº:", margin + 66, margin + 26)
  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(4)
  pdf.text(studentData.studentIdNumber || "", margin + 66, margin + 29)

  pdf.setTextColor(55, 65, 81) // Dark gray

  // Name section - moved and resized
  pdf.setFontSize(5.5)
  pdf.setFont("helvetica", "bold")
  pdf.text("NOME:", margin + 17, margin + 14)
  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(4.5)
  const nameLines = pdf.splitTextToSize((studentData.fullName || "").toUpperCase(), 46)
  pdf.text(nameLines, margin + 17, margin + 17)

  // Birth date and Registration - better positioning
  pdf.setFontSize(5)
  pdf.setFont("helvetica", "bold")
  pdf.text("NASCIMENTO:", margin + 17, margin + 22)
  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(4.5)
  const formattedDate = formatBirthDate(studentData.birthDate)
  pdf.text(formattedDate, margin + 17, margin + 25)

  pdf.setFontSize(5)
  pdf.setFont("helvetica", "bold")
  pdf.text("MATRÍCULA:", margin + 40, margin + 22)
  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(4.5)
  pdf.text(studentData.studentIdNumber || "", margin + 40, margin + 25)

  // CPF and RG section - better spacing
  pdf.setFontSize(5)
  pdf.setFont("helvetica", "bold")
  pdf.text("CPF:", margin + 17, margin + 29)
  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(4.5)
  pdf.text(studentData.cpf || "", margin + 17, margin + 32)

  pdf.setFontSize(5)
  pdf.setFont("helvetica", "bold")
  pdf.text("RG:", margin + 45, margin + 29)
  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(4.5)
  pdf.text(studentData.rg || "", margin + 45, margin + 32)

  // School section - repositioned for better readability
  pdf.setFontSize(5)
  pdf.setFont("helvetica", "bold")
  pdf.text("INSTITUIÇÃO:", margin + 17, margin + 36)
  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(4)
  const schoolLines = pdf.splitTextToSize((studentData.schoolName || "").toUpperCase(), 46)
  pdf.text(schoolLines, margin + 17, margin + 39)

  pdf.setFontSize(5)
  pdf.setFont("helvetica", "bold")
  pdf.text("CURSO:", margin + 2, margin + 43)
  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(4)
  const courseLines = pdf.splitTextToSize((studentData.course || "").toUpperCase(), 35)
  pdf.text(courseLines, margin + 2, margin + 46)

  if (studentData.city && studentData.transportType) {
    pdf.setFillColor(cardColors.primary.r, cardColors.primary.g, cardColors.primary.b, 0.1)
    pdf.rect(margin + 40, margin + 42, 40, 6, "F")

    pdf.setTextColor(255, 255, 255) // White text
    pdf.setFontSize(4.5)
    pdf.setFont("helvetica", "bold")
    pdf.text("TRANSPORTE:", margin + 41, margin + 45)
    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(4)
    const cityText = getCityText(studentData.city)
    const transportText = getTransportTypeText(studentData.transportType)
    pdf.text(`${cityText} - ${transportText}`, margin + 41, margin + 47.5)
  }

  pdf.setTextColor(cardColors.primary.r, cardColors.primary.g, cardColors.primary.b)
  pdf.setFontSize(3.5)
  pdf.setFont("helvetica", "normal")
  const currentYear = new Date().getFullYear()
  const validityYear = currentYear + 1
  pdf.text(`Válida até 31/03/${validityYear} - Lei Federal nº 12.933/2013`, margin + 2, margin + 51.5)

  return pdf.output("blob")
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function getGradeLevelText(gradeLevel: string): string {
  const gradeMap: Record<string, string> = {
    "1-ano-fundamental": "1º ANO FUND.",
    "2-ano-fundamental": "2º ANO FUND.",
    "3-ano-fundamental": "3º ANO FUND.",
    "4-ano-fundamental": "4º ANO FUND.",
    "5-ano-fundamental": "5º ANO FUND.",
    "6-ano-fundamental": "6º ANO FUND.",
    "7-ano-fundamental": "7º ANO FUND.",
    "8-ano-fundamental": "8º ANO FUND.",
    "9-ano-fundamental": "9º ANO FUND.",
    "1-ano-medio": "1º ANO MÉDIO",
    "2-ano-medio": "2º ANO MÉDIO",
    "3-ano-medio": "3º ANO MÉDIO",
    superior: "SUPERIOR",
    tecnico: "TÉCNICO",
  }
  return gradeMap[gradeLevel] || (gradeLevel || "").toUpperCase()
}

function getCityText(city: string): string {
  const cityMap: Record<string, string> = {
    "monte-carmelo": "M. CARMELO",
    uberaba: "UBERABA",
    uberlandia: "UBERLÂNDIA",
  }
  return cityMap[city] || (city || "").toUpperCase()
}

function getTransportTypeText(transportType: string): string {
  const transportMap: Record<string, string> = {
    "onibus-municipal": "ÔNIBUS MUN.",
    "onibus-escolar": "ÔNIBUS ESC.",
    "van-escolar": "VAN ESCOLAR",
    "transporte-universitario": "TRANSP. UNIV.",
    outros: "OUTROS",
  }
  return transportMap[transportType] || (transportType || "").toUpperCase()
}

function getCityColors(city: string) {
  const colorMap: Record<string, { primary: { r: number; g: number; b: number }; hex: string }> = {
    "monte-carmelo": {
      primary: { r: 255, g: 193, b: 7 }, // Yellow
      hex: "#ffc107",
    },
    uberlandia: {
      primary: { r: 59, g: 130, b: 246 }, // Blue
      hex: "#3b82f6",
    },
    uberaba: {
      primary: { r: 34, g: 197, b: 94 }, // Green
      hex: "#22c55e",
    },
  }

  // Default to green if city not found
  return (
    colorMap[city] || {
      primary: { r: 21, g: 128, b: 61 },
      hex: "#15803d",
    }
  )
}

function getTransportColors(transportType: string, city: string) {
  // If transport is JN Tour, always use yellow regardless of city
  if (transportType && transportType.toLowerCase().includes("jn tour")) {
    return {
      primary: { r: 255, g: 193, b: 7 }, // Yellow
      hex: "#ffc107",
    }
  }

  // If transport is Cachoeira Transportes, always use sky blue regardless of city
  if (transportType && transportType.toLowerCase().includes("cachoeira")) {
    return {
      primary: { r: 135, g: 206, b: 235 }, // Sky blue
      hex: "#87ceeb",
    }
  }

  // If transport is Marques Turismo, always use olive green regardless of city
  if (transportType && transportType.toLowerCase().includes("marques")) {
    return {
      primary: { r: 128, g: 128, b: 0 }, // Olive green
      hex: "#808000",
    }
  }

  // If transport is Silva&Cunha, use white background with dark navy blue for contrast
  if (transportType && transportType.toLowerCase().includes("silva") && transportType.toLowerCase().includes("cunha")) {
    return {
      primary: { r: 25, g: 25, b: 112 }, // Dark navy blue for high contrast on white
      hex: "#191970",
    }
  }

  // Otherwise use city-based colors
  return getCityColors(city)
}

function formatBirthDate(birthDate: string): string {
  if (!birthDate) return ""

  // Split the date string (YYYY-MM-DD format from HTML date input)
  const [year, month, day] = birthDate.split("-")

  // Return in Brazilian format (DD/MM/YYYY)
  return `${day}/${month}/${year}`
}
