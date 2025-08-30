import { StudentIdForm } from "@/components/student-id-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header with municipal branding */}
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-foreground/10 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold">NP</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-balance">Prefeitura Municipal de Nova Ponte - MG</h1>
              <p className="text-primary-foreground/80">Sistema de Geração de Carteira de Estudante Digital</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-balance">Gerar Carteira de Estudante Digital</CardTitle>
              <CardDescription className="text-pretty">
                Preencha os dados abaixo para gerar sua carteira de estudante digital. Todos os campos marcados com *
                são obrigatórios.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StudentIdForm />
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="text-sm">© 2025 Prefeitura Municipal de Nova Ponte - MG. Todos os direitos reservados.</p>
          <p className="text-xs mt-2">Carteiras emitidas conforme Lei Federal nº 12.933/2013</p>
        </div>
      </footer>
    </div>
  )
}
