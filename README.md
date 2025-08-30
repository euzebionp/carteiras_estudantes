# Sistema de Geração de Carteira de Estudante Digital - Nova Ponte/MG

Sistema web desenvolvido para a Prefeitura Municipal de Nova Ponte - MG para geração de carteiras de estudante digitais com validação de matrícula, controle de transporte escolar e emissão de documentos em PDF.

## 🚀 Funcionalidades

### 📋 Gestão de Estudantes
- **Validação por Matrícula**: Sistema de consulta automática baseado em números de matrícula únicos
- **Base de Dados Integrada**: Consulta automática de dados pessoais (nome, RG, CPF) por matrícula
- **Preenchimento Automático**: Campos preenchidos automaticamente após validação da matrícula
- **Controle de Geração Única**: Cada aluno pode gerar apenas uma carteira (com override administrativo)

### 🚌 Sistema de Transporte Escolar
- **Mapeamento por Cidade**: Diferentes empresas transportadoras para cada cidade
  - **Uberlândia**: JN Tour (Arara), Cachoeira Transportes, Marques Turismo, Silva&Cunha
  - **Monte Carmelo**: Novatur Ltda
  - **Uberaba**: Empresas específicas por lista de estudantes
- **Seleção Automática**: Empresa transportadora definida automaticamente baseada na matrícula
- **Cores Personalizadas**: Cada empresa possui cor específica na carteira

### 🎨 Sistema de Cores por Transportadora
- **JN Tour**: Amarelo
- **Cachoeira Transportes**: Azul céu
- **Marques Turismo**: Verde oliva
- **Silva&Cunha**: Branco com contraste escuro
- **Novatur Ltda**: Verde (padrão Monte Carmelo)

### 📄 Geração de PDF
- **Dimensões Oficiais**: 85mm x 55mm (padrão carteira de estudante)
- **QR Code**: Gerado automaticamente com dados do estudante
- **Brasão Municipal**: Logo oficial da Prefeitura de Nova Ponte
- **Informações Completas**: Nome, foto, curso, instituição, dados pessoais, transporte
- **Conformidade Legal**: Texto legal conforme Lei Federal nº 12.933/2013

### 🔐 Controle Administrativo
- **Senha de Administrador**: `14082025Eu*` para override de geração múltipla
- **Validação de Matrícula**: Apenas matrículas cadastradas podem gerar carteiras
- **Campos Protegidos**: Nome e transportadora não editáveis após consulta automática

## 🏗️ Tecnologias Utilizadas

- **Framework**: Next.js 14.2.4
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS v4
- **Componentes**: shadcn/ui
- **PDF**: jsPDF
- **QR Code**: qrcode
- **Fontes**: Geist Sans & Geist Mono

## 📁 Estrutura do Projeto

\`\`\`
├── app/
│   ├── api/generate-pdf/     # API para geração de PDF
│   ├── globals.css           # Estilos globais e tema municipal
│   ├── layout.tsx           # Layout principal
│   └── page.tsx             # Página inicial
├── components/
│   ├── student-id-form.tsx  # Formulário principal
│   └── ui/                  # Componentes shadcn/ui
├── lib/
│   ├── pdf-generator.ts     # Gerador de PDF com layout personalizado
│   ├── student-database.ts  # Base de dados de estudantes
│   └── utils.ts            # Utilitários
└── public/
    └── images/             # Brasão municipal e assets
\`\`\`

## 🎯 Cidades e Instituições Suportadas

### Uberlândia - MG
- UFU, Uniessa, UNIUBE, Colégio Profissional, Anhanguera, UNITRI
- Uniasselvi, Unicesumar, UNIPAC, Fatra, ESAMC, Grau técnico
- Proz, Uniube Vila Gávea, FAVENI, Estácio, Cebrac, Mix curso

### Monte Carmelo - MG
- UFU, Uniessa, UNIUBE, Colégio Profissional, Anhanguera, UNITRI
- Uniasselvi, Unicesumar, UNIPAC, Fatra, ESAMC, Unifucamp

### Uberaba - MG
- FAZU, EFOP, UNIUBE, Uniube/Policlínica, SENAI, Grau Técnico
- Senac, UFTM, IFTM, Conservatório, Uniasselvi, Cebrac

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação
\`\`\`bash
# Clone o repositório
git clone [url-do-repositorio]

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm run dev

# Acesse http://localhost:3000
\`\`\`

### Build para Produção
\`\`\`bash
npm run build
npm start
\`\`\`

## 📋 Como Usar

1. **Inserir Matrícula**: Digite o número da matrícula do estudante
2. **Validação Automática**: Sistema consulta a base de dados e preenche informações
3. **Completar Dados**: Preencha dados pessoais e acadêmicos restantes
4. **Upload de Foto**: Adicione foto do estudante (obrigatório)
5. **Gerar Carteira**: Sistema gera PDF com layout personalizado
6. **Download**: Arquivo salvo com nome do estudante

## 🔒 Segurança

- Validação de matrícula obrigatória
- Controle de geração única por estudante
- Senha administrativa para override
- Validação de dados obrigatórios
- Proteção contra geração não autorizada

## 📞 Suporte

Sistema desenvolvido para a Prefeitura Municipal de Nova Ponte - MG
Conforme Lei Federal nº 12.933/2013

---

© 2025 Prefeitura Municipal de Nova Ponte - MG. Todos os direitos reservados.
