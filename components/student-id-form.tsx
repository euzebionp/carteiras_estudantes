"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Upload, FileImage, AlertCircle, CheckCircle, Download, Mail, Search } from "lucide-react"
import {
  isValidMatricula,
  getCityFromMatricula,
  getStudentData,
  getAvailableTransportOptions,
} from "@/lib/student-database"

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
  institution: string
}

export function StudentIdForm() {
  const [studentIdLookup, setStudentIdLookup] = useState("")
  const [isFormEnabled, setIsFormEnabled] = useState(false)
  const [lookupError, setLookupError] = useState("")
  const [availableTransportOptions, setAvailableTransportOptions] = useState<string[]>([])
  const [isDataAutoFilled, setIsDataAutoFilled] = useState(false)
  const [generatedDocuments, setGeneratedDocuments] = useState<Set<string>>(new Set())
  const [showAdminDialog, setShowAdminDialog] = useState(false)
  const [adminPassword, setAdminPassword] = useState("")
  const [adminPasswordError, setAdminPasswordError] = useState("")

  const institutionsByCity = {
    uberaba: [
      "FAZU",
      "EFOP",
      "UNIUBE",
      "Uniube / Policlínica",
      "SENAI",
      "Grau Técnico",
      "Senac",
      "UFTM",
      "IFTM",
      "Conservatório",
      "Uniasselvi",
      "Cebrac",
    ],
    uberlandia: [
      "UFU",
      "Uniessa",
      "UNIUBE",
      "Colégio Profissional",
      "Anhanguera",
      "UNITRI",
      "Uniasselvi",
      "Unicesumar",
      "UNIPAC",
      "Fatra",
      "ESAMC",
      "Grau técnico",
      "Proz",
      "Uniube Vila Gávea",
      "FAVENI",
      "Estácio",
      "Cebrac",
      "Uniube via centro",
      "ESAMC",
      "Escola do Mecânico",
      "Mix curso",
    ],
    "monte-carmelo": [
      "UFU",
      "Uniessa",
      "UNIUBE",
      "Colégio Profissional",
      "Anhanguera",
      "UNITRI",
      "Uniasselvi",
      "Unicesumar",
      "UNIPAC",
      "Fatra",
      "ESAMC",
      "Grau técnico",
      "Proz",
      "Uniube Vila Gávea",
      "FAVENI",
      "Estácio",
      "Cebrac",
      "Uniube via centro",
      "ESAMC",
      "Escola do Mecânico",
      "Mix curso",
      "Unifucamp",
    ],
  }

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [sendByEmail, setSendByEmail] = useState(false)
  const [emailAddress, setEmailAddress] = useState("")

  const photoInputRef = useRef<HTMLInputElement>(null)

  const handleStudentLookup = () => {
    if (!studentIdLookup.trim()) {
      setLookupError("Por favor, insira um número de matrícula")
      return
    }

    const matricula = studentIdLookup.trim()
    const cityFromMatricula = getCityFromMatricula(matricula)

    if (!cityFromMatricula) {
      setLookupError("Formato de matrícula inválido")
      setIsFormEnabled(false)
      return
    }

    const isValid = isValidMatricula(matricula, cityFromMatricula)

    if (isValid) {
      setIsFormEnabled(true)
      setLookupError("")

      const studentData = getStudentData(matricula)
      const transportOptions = getAvailableTransportOptions(matricula)
      setAvailableTransportOptions(transportOptions)

      console.log("[v0] Matricula:", matricula, "Transport options:", transportOptions)

      const hasStudentData = studentData && studentData.name
      setIsDataAutoFilled(hasStudentData)

      setFormData((prev) => ({
        ...prev,
        studentIdNumber: matricula,
        city: cityFromMatricula,
        fullName: studentData?.name || "",
        schoolName: studentData?.institution || "",
        course: studentData?.course || "",
        institution: studentData?.institution || "",
        transportType: transportOptions.length === 1 ? transportOptions[0] : "",
      }))
    } else {
      setIsFormEnabled(false)
      setLookupError("Matrícula não encontrada na base de dados")
      setAvailableTransportOptions([])
      setIsDataAutoFilled(false)
    }
  }

  useEffect(() => {
    if (!studentIdLookup.trim()) {
      setIsFormEnabled(false)
      setLookupError("")
      setAvailableTransportOptions([])
      setIsDataAutoFilled(false)
      setFormData({
        fullName: "",
        birthDate: "",
        schoolName: "",
        gradeLevel: "",
        course: "",
        registrationNumber: "",
        studentIdNumber: "",
        schoolAddress: "Nova Ponte, MG",
        contactInfo: "",
        photo: null,
        city: "",
        transportType: "",
        institution: "",
      })
    }
  }, [studentIdLookup])

  const [formData, setFormData] = useState<StudentData>({
    fullName: "",
    birthDate: "",
    schoolName: "",
    gradeLevel: "",
    course: "",
    registrationNumber: "",
    studentIdNumber: "",
    schoolAddress: "Nova Ponte, MG",
    contactInfo: "",
    photo: null,
    city: "",
    transportType: "",
    institution: "",
  })

  const handleInputChange = (field: keyof StudentData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (field === "city") {
      setFormData((prev) => ({ ...prev, institution: "" }))
      if (errors.institution) {
        setErrors((prev) => ({ ...prev, institution: "" }))
      }

      setFormData((prev) => ({ ...prev, transportType: "" }))
      if (value === "monte-carmelo" && availableTransportOptions.length === 0) {
        setAvailableTransportOptions(["Novatur Ltda"])
      }
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, photo: file }))
    }
  }

  const handlePhotoClick = () => {
    if (isFormEnabled && photoInputRef.current) {
      photoInputRef.current.click()
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Nome completo é obrigatório"
    }

    if (!formData.birthDate) {
      newErrors.birthDate = "Data de nascimento é obrigatória"
    }

    if (!formData.schoolName.trim()) {
      newErrors.schoolName = "Nome da escola é obrigatório"
    }

    if (!formData.gradeLevel) {
      newErrors.gradeLevel = "Nível de ensino é obrigatório"
    }

    if (!formData.course.trim()) {
      newErrors.course = "Nome do curso é obrigatório"
    }

    if (!formData.studentIdNumber.trim()) {
      newErrors.studentIdNumber = "Número de matrícula é obrigatório"
    }

    if (!formData.contactInfo.trim()) {
      newErrors.contactInfo = "Telefone ou e-mail é obrigatório"
    }

    if (!formData.photo) {
      newErrors.photo = "Foto é obrigatória"
    }

    if (!formData.city) {
      newErrors.city = "Cidade é obrigatória"
    }

    if (!formData.transportType) {
      newErrors.transportType = "Empresa transportadora é obrigatória"
    }

    if (!formData.institution) {
      newErrors.institution = "Instituição de ensino é obrigatória"
    }

    if (sendByEmail) {
      if (!emailAddress.trim()) {
        newErrors.email = "E-mail é obrigatório para envio por e-mail"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
        newErrors.email = "Por favor, insira um e-mail válido"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    const matricula = formData.studentIdNumber
    if (generatedDocuments.has(matricula)) {
      setShowAdminDialog(true)
      return
    }

    await generateDocument()
  }

  const handleAdminPasswordSubmit = () => {
    const correctPassword = "14082025Eu*"
    if (adminPassword === correctPassword) {
      setShowAdminDialog(false)
      setAdminPassword("")
      setAdminPasswordError("")
      generateDocument()
    } else {
      setAdminPasswordError("Senha de administrador incorreta")
    }
  }

  const generateDocument = async () => {
    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("fullName", formData.fullName)
      formDataToSend.append("birthDate", formData.birthDate)
      formDataToSend.append("schoolName", formData.schoolName)
      formDataToSend.append("gradeLevel", formData.gradeLevel)
      formDataToSend.append("course", formData.course)
      formDataToSend.append("registrationNumber", formData.registrationNumber)
      formDataToSend.append("studentIdNumber", formData.studentIdNumber)
      formDataToSend.append("schoolAddress", formData.schoolAddress)
      formDataToSend.append("contactInfo", formData.contactInfo)
      formDataToSend.append("city", formData.city)
      formDataToSend.append("transportType", formData.transportType)
      formDataToSend.append("institution", formData.institution)
      formDataToSend.append("sendByEmail", sendByEmail.toString())
      if (sendByEmail) {
        formDataToSend.append("emailAddress", emailAddress)
      }

      if (formData.photo) {
        formDataToSend.append("photo", formData.photo)
      }

      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) {
        let errorMessage = "Erro ao gerar PDF"
        try {
          const contentType = response.headers.get("content-type")
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError)
        }
        throw new Error(errorMessage)
      }

      if (!sendByEmail) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url

        // Get student name from database first, then fallback to form data
        const studentData = getStudentData(formData.studentIdNumber)
        const studentName = studentData?.name || formData.fullName
        const fileName = studentName
          .replace(/\s+/g, "-")
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "") // Remove special characters

        a.download = `${fileName}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }

      setGeneratedDocuments((prev) => new Set(prev).add(formData.studentIdNumber))
      setSubmitSuccess(true)
    } catch (error) {
      console.error("Erro ao gerar carteira:", error)
      setErrors({ submit: error instanceof Error ? error.message : "Erro desconhecido ao gerar carteira" })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="space-y-4">
        <Alert className="border-accent bg-accent/10">
          <CheckCircle className="h-4 w-4 text-accent" />
          <AlertDescription className="text-accent-foreground">
            <strong>Carteira gerada com sucesso!</strong>
            <br />
            {sendByEmail ? (
              <>
                Sua carteira de estudante digital foi enviada para o e-mail {emailAddress}. Verifique sua caixa de
                entrada e pasta de spam.
              </>
            ) : (
              <>
                Sua carteira de estudante digital foi gerada e o download iniciou automaticamente. Se o download não
                iniciou, verifique a pasta de downloads do seu navegador.
              </>
            )}
          </AlertDescription>
        </Alert>

        <div className="pt-4">
          <Button
            onClick={() => {
              setSubmitSuccess(false)
              setStudentIdLookup("")
              setIsFormEnabled(false)
              setLookupError("")
              setFormData({
                fullName: "",
                birthDate: "",
                schoolName: "",
                gradeLevel: "",
                course: "",
                registrationNumber: "",
                studentIdNumber: "",
                schoolAddress: "Nova Ponte, MG",
                contactInfo: "",
                photo: null,
                city: "",
                transportType: "",
                institution: "",
              })
              setErrors({})
              setSendByEmail(false)
              setEmailAddress("")
            }}
            className="w-full"
            size="lg"
            variant="outline"
          >
            Gerar Nova Carteira
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Documento já gerado</DialogTitle>
            <DialogDescription>
              Este aluno já possui uma carteira gerada. Para gerar um novo documento, é necessária a senha de
              administrador.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminPassword">Senha de Administrador</Label>
              <Input
                id="adminPassword"
                type="password"
                value={adminPassword}
                onChange={(e) => {
                  setAdminPassword(e.target.value)
                  setAdminPasswordError("")
                }}
                placeholder="Digite a senha de administrador"
                className={adminPasswordError ? "border-destructive" : ""}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAdminPasswordSubmit()
                  }
                }}
              />
              {adminPasswordError && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {adminPasswordError}
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowAdminDialog(false)
                setAdminPassword("")
                setAdminPasswordError("")
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleAdminPasswordSubmit}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <Alert className="border-destructive bg-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">{errors.submit}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Busca de Estudante</h3>

          <div className="space-y-2">
            <Label htmlFor="studentLookup">Número de Matrícula *</Label>
            <div className="flex gap-2">
              <Input
                id="studentLookup"
                value={studentIdLookup}
                onChange={(e) => {
                  setStudentIdLookup(e.target.value)
                  setLookupError("")
                }}
                placeholder="Ex: 101050, 202051, 303051"
                className={lookupError ? "border-destructive" : ""}
              />
              <Button type="button" onClick={handleStudentLookup} variant="outline" className="px-3 bg-transparent">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {lookupError && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {lookupError}
              </p>
            )}
            {isFormEnabled && !lookupError && (
              <Alert className="border-accent bg-accent/10">
                <CheckCircle className="h-4 w-4 text-accent" />
                <AlertDescription className="text-accent-foreground">
                  <strong>Matrícula válida encontrada!</strong>
                  <br />
                  <span className="text-sm">Formulário habilitado para preenchimento</span>
                </AlertDescription>
              </Alert>
            )}
            <p className="text-xs text-muted-foreground">
              Digite o número de matrícula e clique em buscar para habilitar o formulário
            </p>
          </div>
        </div>

        <div className={`space-y-6 ${!isFormEnabled ? "opacity-50 pointer-events-none" : ""}`}>
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Dados Pessoais</h3>

            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                placeholder="Digite seu nome completo"
                className={errors.fullName ? "border-destructive" : ""}
                disabled={!isFormEnabled || isDataAutoFilled}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.fullName}
                </p>
              )}
              {isDataAutoFilled && formData.fullName && (
                <p className="text-xs text-muted-foreground">Nome extraído automaticamente da base de dados</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de Nascimento *</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleInputChange("birthDate", e.target.value)}
                className={errors.birthDate ? "border-destructive" : ""}
                disabled={!isFormEnabled}
              />
              {errors.birthDate && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.birthDate}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactInfo">Telefone ou E-mail *</Label>
              <Input
                id="contactInfo"
                value={formData.contactInfo}
                onChange={(e) => handleInputChange("contactInfo", e.target.value)}
                placeholder="(34) 99999-9999 ou email@exemplo.com"
                className={errors.contactInfo ? "border-destructive" : ""}
                disabled={!isFormEnabled}
              />
              {errors.contactInfo && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.contactInfo}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Informações de Transporte</h3>

            <div className="space-y-2">
              <Label htmlFor="city">Cidade de Destino *</Label>
              <Select
                value={formData.city}
                onValueChange={(value) => handleInputChange("city", value)}
                disabled={!isFormEnabled}
              >
                <SelectTrigger className={errors.city ? "border-destructive" : ""}>
                  <SelectValue placeholder="Selecione a cidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monte-carmelo">Monte Carmelo - MG</SelectItem>
                  <SelectItem value="uberaba">Uberaba - MG</SelectItem>
                  <SelectItem value="uberlandia">Uberlândia - MG</SelectItem>
                </SelectContent>
              </Select>
              {errors.city && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.city}
                </p>
              )}
            </div>

            {formData.city && (
              <div className="space-y-2">
                <Label htmlFor="institution">Instituição de Ensino *</Label>
                <Select
                  value={formData.institution}
                  onValueChange={(value) => handleInputChange("institution", value)}
                  disabled={!isFormEnabled}
                >
                  <SelectTrigger className={errors.institution ? "border-destructive" : ""}>
                    <SelectValue placeholder="Selecione a instituição" />
                  </SelectTrigger>
                  <SelectContent>
                    {institutionsByCity[formData.city as keyof typeof institutionsByCity]?.map((institution) => (
                      <SelectItem key={institution} value={institution}>
                        {institution}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.institution && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.institution}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="transportType">Empresa Transportadora *</Label>
              <Select
                value={formData.transportType}
                onValueChange={(value) => handleInputChange("transportType", value)}
                disabled={!isFormEnabled}
              >
                <SelectTrigger className={errors.transportType ? "border-destructive" : ""}>
                  <SelectValue placeholder="Selecione a empresa transportadora" />
                </SelectTrigger>
                <SelectContent>
                  {availableTransportOptions.length > 0 ? (
                    availableTransportOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))
                  ) : formData.city === "monte-carmelo" ? (
                    <SelectItem value="Novatur Ltda">Novatur Ltda</SelectItem>
                  ) : (
                    <>
                      <SelectItem value="Ônibus Municipal">Ônibus Municipal</SelectItem>
                      <SelectItem value="Ônibus Escolar">Ônibus Escolar</SelectItem>
                      <SelectItem value="Van Escolar">Van Escolar</SelectItem>
                      <SelectItem value="Transporte Universitário">Transporte Universitário</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              {errors.transportType && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.transportType}
                </p>
              )}
              {availableTransportOptions.length === 1 && (
                <p className="text-xs text-muted-foreground">
                  Empresa designada para esta matrícula: {availableTransportOptions[0]}
                </p>
              )}
              {formData.city === "monte-carmelo" && availableTransportOptions.length === 0 && (
                <p className="text-xs text-muted-foreground">Transporte disponível para Monte Carmelo: Novatur Ltda</p>
              )}
            </div>
          </div>

          {/* School Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Dados Escolares</h3>

            <div className="space-y-2">
              <Label htmlFor="schoolName">Nome da Escola/Instituição *</Label>
              <Input
                id="schoolName"
                value={formData.schoolName}
                onChange={(e) => handleInputChange("schoolName", e.target.value)}
                placeholder="Ex: Universidade Federal de Uberlândia"
                className={errors.schoolName ? "border-destructive" : ""}
                disabled={!isFormEnabled}
              />
              {errors.schoolName && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.schoolName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentIdNumber">Número de Matrícula *</Label>
              <Input
                id="studentIdNumber"
                value={formData.studentIdNumber}
                onChange={(e) => handleInputChange("studentIdNumber", e.target.value)}
                placeholder="Ex: 2024001234"
                className={errors.studentIdNumber ? "border-destructive" : ""}
                disabled={!isFormEnabled}
                readOnly
              />
              {errors.studentIdNumber && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.studentIdNumber}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Este número será usado para gerar o QR Code na carteirinha
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gradeLevel">Nível de Ensino *</Label>
              <Select
                value={formData.gradeLevel}
                onValueChange={(value) => handleInputChange("gradeLevel", value)}
                disabled={!isFormEnabled}
              >
                <SelectTrigger className={errors.gradeLevel ? "border-destructive" : ""}>
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="superior">Ensino Superior</SelectItem>
                </SelectContent>
              </Select>
              {errors.gradeLevel && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.gradeLevel}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="course">Nome do Curso *</Label>
              <Input
                id="course"
                value={formData.course}
                onChange={(e) => handleInputChange("course", e.target.value)}
                placeholder="Ex: Engenharia Civil, Administração, Medicina"
                className={errors.course ? "border-destructive" : ""}
                disabled={!isFormEnabled}
              />
              {errors.course && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.course}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Número de Registro Adicional</Label>
              <Input
                id="registrationNumber"
                value={formData.registrationNumber}
                onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
                placeholder="Número adicional, se aplicável"
                disabled={!isFormEnabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="schoolAddress">Endereço da Instituição</Label>
              <Input
                id="schoolAddress"
                value={formData.schoolAddress}
                onChange={(e) => handleInputChange("schoolAddress", e.target.value)}
                placeholder="Cidade, Estado"
                disabled={!isFormEnabled}
              />
            </div>
          </div>

          {/* Photo Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Foto do Estudante</h3>

            <div className="space-y-2">
              <Label htmlFor="photo">Foto Recente (3x4) *</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-accent transition-colors">
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  ref={photoInputRef}
                />
                <div
                  className={`cursor-pointer block ${!isFormEnabled ? "cursor-not-allowed opacity-50" : "hover:bg-accent/5 rounded-lg p-2 transition-colors"}`}
                  onClick={handlePhotoClick}
                >
                  <div className="flex flex-col items-center gap-2">
                    {formData.photo ? (
                      <>
                        <FileImage className="h-8 w-8 text-accent" />
                        <p className="text-sm text-foreground font-medium">{formData.photo.name}</p>
                        <p className="text-xs text-muted-foreground">Clique para alterar a foto</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-foreground font-medium">Clique para selecionar uma foto</p>
                        <p className="text-xs text-muted-foreground">JPG, PNG - Máximo 5MB</p>
                      </>
                    )}
                  </div>
                </div>
                {!formData.photo && isFormEnabled && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3 bg-transparent"
                    onClick={(e) => {
                      e.preventDefault()
                      handlePhotoClick()
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar Foto
                  </Button>
                )}
              </div>
              {errors.photo && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.photo}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Recomendamos uma foto no formato 3x4, com fundo claro e boa qualidade para melhor resultado na
                carteirinha.
              </p>
            </div>
          </div>

          {/* Delivery Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Opções de Entrega</h3>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sendByEmail"
                  checked={sendByEmail}
                  onCheckedChange={(checked) => {
                    setSendByEmail(checked as boolean)
                    if (!checked) {
                      setEmailAddress("")
                      setErrors((prev) => ({ ...prev, email: "" }))
                    }
                  }}
                  disabled={!isFormEnabled}
                />
                <Label htmlFor="sendByEmail" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Enviar carteira por e-mail
                </Label>
              </div>

              {sendByEmail && (
                <div className="space-y-2 ml-6">
                  <Label htmlFor="emailAddress">E-mail para envio *</Label>
                  <Input
                    id="emailAddress"
                    type="email"
                    value={emailAddress}
                    onChange={(e) => {
                      setEmailAddress(e.target.value)
                      if (errors.email) {
                        setErrors((prev) => ({ ...prev, email: "" }))
                      }
                    }}
                    placeholder="seu-email@exemplo.com"
                    className={errors.email ? "border-destructive" : ""}
                    disabled={!isFormEnabled}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.email}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    A carteira será enviada como anexo PDF para este e-mail
                  </p>
                </div>
              )}

              {!sendByEmail && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground ml-6">
                  <Download className="h-4 w-4" />A carteira será baixada automaticamente no seu dispositivo
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={isSubmitting || !isFormEnabled} size="lg">
              {isSubmitting
                ? "Gerando Carteira..."
                : sendByEmail
                  ? "Gerar e Enviar por E-mail"
                  : "Gerar e Baixar Carteira"}
            </Button>
          </div>

          {/* Legal Notice */}
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>Ao gerar a carteira, você concorda com os termos de uso e política de privacidade.</p>
            <p>Carteira válida até 31 de março do ano seguinte, conforme Lei Federal nº 12.933/2013.</p>
          </div>
        </div>
      </form>
    </>
  )
}
