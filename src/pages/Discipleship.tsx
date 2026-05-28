import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { exportToCSV, exportToPDF } from "../utils/exportData";
import {
  createServerDiscipleshipEnrollment,
  fetchNetworkInfo,
  fetchServerMembers,
  fetchServerDiscipleshipState,
  fetchServerVisitors,
  saveServerDiscipleshipState,
} from "../services/crm.service";
import { sendWhatsAppMessage } from "../services/whatsapp";
import { compressImageFile, dataUrlSize } from "../utils/image";
import {
  Heart,
  Search,
  BookOpen,
  Calendar,
  Plus,
  X,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  Star,
  Bookmark,
  Award,
  Download,
  FileSpreadsheet,
  FileText,
  Send,
  Copy,
  RefreshCw,
  Users
} from "lucide-react";
import DiscipleshipQuiz from "../components/DiscipleshipQuiz";

const DEFAULT_LESSONS = [
  {
    num: 1, title: "Salvação", subtitle: "A Graça que nos Encontra",
    base: "Efésios 2:8", baseText: "\"Porque pela graça sois salvos, mediante a fé; e isto não vem de vós; é dom de Deus.\"",
    objective: "Ensinar que a salvação é um presente da graça de Deus recebido pela fé em Jesus Cristo.",
    color: "from-purple-600/20 to-indigo-600/10", border: "border-purple-500/30", icon: "✝️",
    sections: [
      { title: "O Que é Salvação?", items: ["Libertação do poder do pecado","Reconciliação com Deus","Perdão completo","Nova vida em Cristo","Vida eterna"] },
      { title: "O Problema do Pecado", body: "O pecado não é apenas fazer coisas erradas. É viver longe de Deus e colocar outras coisas no centro da vida.", items: ["Culpa","Medo","Vazio","Separação de Deus"] },
      { title: "O Que Jesus Fez por Nós?", body: "Jesus viveu a vida perfeita que não conseguimos viver e morreu a morte que merecíamos.", items: ["Ele carregou nossos pecados","Recebeu nossa condenação","Nos ofereceu perdão e adoção"] },
      { title: "Como Receber a Salvação?", items: ["1. Arrependa-se — Reconheça seu pecado e volte-se para Deus","2. Creia em Jesus — Confie que somente Cristo pode salvar","3. Confesse Jesus como Senhor — Entregue sua vida ao governo de Cristo"] }
    ],
    memory: "\"Se com tua boca confessares Jesus como Senhor e em teu coração creres que Deus o ressuscitou dentre os mortos, serás salvo.\" — Romanos 10:9",
    application: ["Você já entregou sua vida a Cristo?","Em que você tem colocado sua confiança?","Ore hoje recebendo a graça de Deus."]
  },
  {
    num: 2, title: "Oração", subtitle: "Vivendo em Comunhão com Deus",
    base: "1 Tessalonicenses 5:17", baseText: "\"Orai sem cessar.\"",
    objective: "Ensinar que oração é relacionamento com Deus e não apenas um ritual religioso.",
    color: "from-blue-600/20 to-cyan-600/10", border: "border-blue-500/30", icon: "🙏",
    sections: [
      { title: "O Que é Oração?", items: ["Conversar com Deus","Desfrutar da presença do Pai","Abrir o coração","Depender do Senhor"] },
      { title: "Por Que Orar?", items: ["Porque Deus nos ama","Porque precisamos dEle","Porque crescemos espiritualmente","Porque a oração transforma nosso coração"] },
      { title: "Como Devemos Orar?", items: ["Com sinceridade — Deus vê o coração","Com fé — Confiando na bondade do Pai","Com perseverança — Sem desistir","Com humildade — Reconhecendo nossa dependência"] },
      { title: "Tipos de Oração", items: ["Adoração","Gratidão","Confissão","Intercessão","Clamor"] }
    ],
    memory: "\"Lancem sobre ele toda a sua ansiedade, porque ele tem cuidado de vocês.\" — 1 Pedro 5:7",
    application: ["Separe diariamente um tempo com Deus.","Comece com poucos minutos, mas seja constante.","Fale com Deus como um filho fala com o Pai."]
  },
  {
    num: 3, title: "A Palavra", subtitle: "Deus Fala Conosco",
    base: "Salmo 119:105", baseText: "\"Lâmpada para os meus pés é a tua palavra.\"",
    objective: "Mostrar que a Bíblia é a Palavra de Deus e o alimento espiritual do cristão.",
    color: "from-amber-600/20 to-yellow-600/10", border: "border-amber-500/30", icon: "📖",
    sections: [
      { title: "O Que é a Bíblia?", items: ["Palavra inspirada por Deus","Revelação do caráter de Deus","Guia para a vida","Fonte de verdade"] },
      { title: "Por Que Ler a Bíblia?", items: ["Fortalece a fé","Renova a mente","Corrige o coração","Produz maturidade espiritual"] },
      { title: "Como Ler a Bíblia?", items: ["1. Ore antes de ler — Peça entendimento","2. Leia diariamente — A constância é mais importante que quantidade","3. Medite — Pergunte: O que ensina sobre Deus? O que revela sobre mim?","4. Pratique — A Palavra transforma quando é obedecida"] }
    ],
    memory: "\"Toda Escritura é inspirada por Deus.\" — 2 Timóteo 3:16",
    application: ["Crie o hábito diário de leitura bíblica.","Comece pelos Evangelhos.","Anote o que Deus falar ao seu coração."]
  },
  {
    num: 4, title: "Fé", subtitle: "Confiando em Deus",
    base: "Hebreus 11:1", baseText: "\"Ora, a fé é a certeza das coisas que se esperam.\"",
    objective: "Ensinar que a fé cristã é confiança em Deus e em Suas promessas.",
    color: "from-emerald-600/20 to-teal-600/10", border: "border-emerald-500/30", icon: "⚓",
    sections: [
      { title: "O Que é Fé?", items: ["Confiar em Deus","Descansar em Sua graça","Crer mesmo sem ver","Depender de Cristo"] },
      { title: "Como a Fé Cresce?", items: ["Pela Palavra","Pela oração","Pela comunhão","Pela prática da obediência"] },
      { title: "Inimigos da Fé", items: ["Medo","Ansiedade","Autossuficiência","Dúvida alimentada pela incredulidade"] },
      { title: "Exemplos Bíblicos", items: ["Abraão","Davi","Daniel","Maria","Paulo"] }
    ],
    memory: "\"O justo viverá pela fé.\" — Romanos 1:17",
    application: ["Entregue suas preocupações a Deus.","Confie no Senhor mesmo quando não entender tudo.","Caminhe pela fé diariamente."]
  },
  {
    num: 5, title: "Igreja", subtitle: "A Família de Deus",
    base: "Hebreus 10:25", baseText: "\"Não deixemos de congregar-nos.\"",
    objective: "Ensinar a importância da comunhão cristã e da vida em igreja.",
    color: "from-rose-600/20 to-pink-600/10", border: "border-rose-500/30", icon: "⛪",
    sections: [
      { title: "O Que é a Igreja?", items: ["Corpo de Cristo","Família espiritual","Comunidade da graça","Povo de Deus"] },
      { title: "Por Que Precisamos da Igreja?", items: ["Crescemos juntos","Somos encorajados","Aprendemos a amar","Servimos uns aos outros"] },
      { title: "O Que um Cristão Deve Fazer?", items: ["Participar","Servir","Amar","Perdoar","Caminhar em unidade"] },
      { title: "A Igreja Não é Perfeita", body: "A igreja é formada por pecadores alcançados pela graça. Por isso aprendemos humildade, perdão e reconciliação.", items: [] }
    ],
    memory: "\"Vós sois o corpo de Cristo.\" — 1 Coríntios 12:27",
    application: ["Participe fielmente da comunhão.","Desenvolva relacionamentos espirituais.","Descubra maneiras de servir."]
  },
  {
    num: 6, title: "Generosidade", subtitle: "Honrando a Deus com os Recursos",
    base: "2 Coríntios 9:7", baseText: "\"Cada um contribua segundo propôs no coração.\"",
    objective: "Ensinar que generosidade é fruto da graça de Deus no coração.",
    color: "from-orange-600/20 to-amber-600/10", border: "border-orange-500/30", icon: "🌱",
    sections: [
      { title: "O Que é Generosidade?", items: ["Gratidão prática","Confiança em Deus","Amor em ação","Desapego do materialismo"] },
      { title: "Tudo Pertence a Deus", body: "Somos administradores e não donos absolutos. Deus nos dá recursos para suprir necessidades, abençoar pessoas e expandir o Reino.", items: [] },
      { title: "Por Que Contribuímos?", items: ["Porque Deus foi generoso conosco","Porque Cristo se entregou por nós","Porque queremos participar da missão de Deus"] }
    ],
    memory: "\"Mais bem-aventurado é dar do que receber.\" — Atos 20:35",
    application: ["Desenvolva um coração generoso.","Seja fiel e intencional.","Use seus recursos para glorificar a Deus."]
  },
  {
    num: 7, title: "Santidade", subtitle: "Uma Nova Vida em Cristo",
    base: "1 Pedro 1:16", baseText: "\"Sede santos, porque eu sou santo.\"",
    objective: "Ensinar que o cristão é chamado para uma vida transformada pelo Espírito Santo.",
    color: "from-violet-600/20 to-purple-600/10", border: "border-violet-500/30", icon: "🕊️",
    sections: [
      { title: "O Que é Santidade?", body: "Santidade não é perfeccionismo religioso. É viver para Deus, afastar-se do pecado e tornar-se semelhante a Cristo.", items: [] },
      { title: "Como Somos Transformados?", items: ["Pela graça","Pela Palavra","Pelo Espírito Santo","Pelo arrependimento contínuo"] },
      { title: "Fruto do Espírito", items: ["Amor","Alegria","Paz","Paciência","Bondade","Domínio próprio"] }
    ],
    memory: "\"Se alguém está em Cristo, nova criatura é.\" — 2 Coríntios 5:17",
    application: ["Abandone práticas pecaminosas.","Busque uma vida íntegra.","Peça diariamente ajuda ao Espírito Santo."]
  },
  {
    num: 8, title: "Missão", subtitle: "Vivendo para a Glória de Deus",
    base: "Marcos 16:15", baseText: "\"Ide por todo o mundo e pregai o evangelho.\"",
    objective: "Ensinar que todo cristão foi chamado para testemunhar de Jesus.",
    color: "from-sky-600/20 to-blue-600/10", border: "border-sky-500/30", icon: "🌍",
    sections: [
      { title: "O Que é Missão?", body: "Missão é participar da obra de Deus no mundo. Todo cristão é chamado para anunciar o evangelho, amar pessoas, servir e refletir Cristo.", items: [] },
      { title: "Como Testemunhar?", items: ["Com palavras — Compartilhando o evangelho","Com atitudes — Demonstrando amor e graça","Com serviço — Ajudando pessoas em necessidade"] },
      { title: "Jesus é o Centro da Missão", body: "Não anunciamos religião. Anunciamos Cristo crucificado e ressurreto.", items: [] }
    ],
    memory: "\"Vós sois a luz do mundo.\" — Mateus 5:14",
    application: ["Ore por pessoas que não conhecem Jesus.","Compartilhe seu testemunho.","Viva de forma que glorifique a Cristo."]
  }
];

interface DiscipleshipPair {
  id: number;
  mentor: string;
  disciple: string;
  completedLessons: number;
  totalLessons: number;
  lastMeeting: string;
  status: "Em Progresso" | "Concluído" | "Pausado";
  journeyId?: string;
}

interface CourseEnrollment {
  id: number;
  token: string;
  pairId?: number | null;
  memberName: string;
  memberPhone: string;
  journeyId: string;
  journeyName: string;
  lessonNum: number;
  lessonTitle: string;
  courseImageUrl?: string;
  status: string;
  attendance: string;
  score: number;
  totalQuestions: number;
  totalLessons?: number;
  spiritualGrowth?: number;
  courseMessage?: string;
  dispatchDate?: string;
  dispatchTime?: string;
  sentAt?: string;
  error?: string;
  createdAt: string;
  completedAt?: string | null;
}

interface CourseBulkContact {
  id: string;
  name: string;
  phone: string;
  type: "member" | "visitor";
}

interface Journey {
  id: string;
  name: string;
  description: string;
  lessons: any[];
}

const DEFAULT_JOURNEYS: Journey[] = [
  {
    id: "integracao",
    name: "Integração & Fundamentos",
    description: "Jornada inicial de 8 lições fundamentais para consolidação, firmeza espiritual e os primeiros passos na caminhada com Cristo.",
    lessons: DEFAULT_LESSONS
  },
  {
    id: "vida_vitoriosa",
    name: "Vida Vitoriosa",
    description: "Esforce-se para participar destas 12 lições que, sem dúvida, farão de você uma bênção. Permita que o Senhor seja glorificado com a vida abundante que você desfrutará. É isto que Ele espera de você.",
    lessons: [
      {
        num: 1, title: "Determinação", subtitle: "O caminho para se tomar posse da bênção",
        base: "João 14:13", baseText: "\"E tudo quanto pedirdes em meu nome, eu o farei, para que o Pai seja glorificado no Filho.\"",
        objective: "O objetivo deste curso é ajudar o nosso povo a compreender o mistério da fé e a praticar a fé real, deixando a fé da sorte para viver a fé real.",
        color: "from-purple-600/20 to-indigo-600/10", border: "border-purple-500/30", icon: "🎯",
        sections: [
          {
            title: "Introdução — Fé Real vs Fé da Sorte",
            body: "Durante os últimos anos, temos ministrado o Curso Fé para milhares de pessoas. Não são poucas as vezes em que pessoas vêm até nós para agradecer, afirmando que estes ensinamentos mudaram a sua maneira de crer. Sou grato a Deus que nos permitiu conhecer os princípios que davam ao Ministério do Senhor Jesus e dos apóstolos o sucesso descrito amplamente nas páginas das Escrituras. Creio que estes mesmos princípios, se aplicados hoje, darão, também, idêntico sucesso ao povo de Deus.\n\nNão devemos aceitar que o Evangelho — o Poder de Deus — seja igualado às religiões, obras dos homens ou, em alguns casos, dos demônios. O Evangelho é diferente; Ele é o próprio Deus em ação, curando os enfermos, expulsando os demônios, levantando os caídos e revestindo o povo dEle de santidade e de poder.\n\nHá de se levantar um grupo de pessoas conscientes de seus direitos e princípios em Cristo, que mostrarão ao mundo que há uma diferença entre o que serve ao Senhor e o ímpio. Creio que isto já está acontecendo; o entendimento do que somos e temos é o sinal de que o verdadeiro exército de novas criaturas já se ergue para a glória do Senhor.\n\nEsforce-se para participar destas 12 lições que, sem dúvida, farão de você uma bênção. Permita que o Senhor seja glorificado com a vida abundante que você desfrutará. É isto que Ele espera de você.\n\nEm Cristo,\nR. R. Soares",
            items: []
          },
          {
            title: "O Objetivo deste Curso",
            body: "O objetivo deste curso é ajudar o nosso povo a compreender este assunto que para muitos é mistério — o mistério da fé. Seria bom que aqueles que possuem algum conhecimento sobre a fé deixassem de lado o que sabem e, numa atitude sem preconceitos, examinassem conosco as Escrituras como se estivessem iniciando esta caminhada. Não devemos tentar misturar este ensinamento com outro que nos tenha sido ministrado em qualquer outra parte. Isto, além de não ajudar em nada, irá complicar as coisas. Coloque de lado o que você sabe sobre a fé e, no final do curso, faça uma avaliação; se aquilo que você aprendeu neste curso for considerado como bom, jogue fora, então, a velha bagagem. Se o que ministramos você considerar como ineficaz ou como de pouco valor, desconsidere-o e volte a praticar o que antes conhecia.\n\nNa verdade, nós vamos aprender algo novo: Deixar de praticar a fé da sorte para praticar a fé real. Vamos entender o que realmente significa crer em Deus, como enfrentar as situações e sair vencedor, como ter, usar e desfrutar tudo o que Cristo conquistou para nós.",
            items: []
          },
          { title: "Uma Autovalorização", body: "Primeiro de tudo, é preciso que você tenha uma autovalorização da sua pessoa. É ensinado em todas as partes que nós não valemos nada para Deus, que somos seres sem a mínima expressão diante dEle, e que somente por misericórdia é que Ele nos salva. Veja bem: todos crêem que Jesus pagou um alto preço para nos resgatar, o que é verdade. Mas, se o preço pago foi alto, é porque temos um alto valor para o Senhor Deus. Não se paga tanto por aquilo que tem pouco valor.", items: [] },
          { title: "Primeira Lição", body: "Nesta nossa primeira lição sobre a fé vamos aprender o que é determinação. Em João 14.13, temos a seguinte promessa do Senhor Jesus: E tudo quanto pedirdes em meu nome, eu o farei, para que o Pai seja glorificado no Filho. Segundo os entendidos na língua grega esta palavra pedirdes está mal traduzida. Teria sido melhor determinardes. Então, aqui está a primeira lição. Não precisamos pedir a bênção e sim determinar, exigir, mandar, ou seja: tomar posse daquilo que aprendemos pela Palavra que nos pertence. Há muita coisa nova que vamos aprender nestas lições sobre a fé, e sempre que aprendemos algo, devemos colocar logo em prática. Não devemos ser lerdos em tomar posse daquilo que é nosso. Quando o Senhor nos dá uma revelação, junto a ela Ele nos dá a bênção.", items: [] },
          { title: "Com Você Também", body: "A partir de agora, não precisamos mais orar pedindo a cura, a prosperidade ou a vitória sobre as tentações. Mas, determinar ou exigir que o mal saia da nossa vida. Na cidade de Catanduva, no interior de São Paulo, um senhor me procurou para contar o que lhe aconteceu com a sua criação de porcos e galinhas, que estava morrendo. Disse-me que todos os dias tinha que enterrar pelo menos uma criação. Segundo o seu relato, ele já havia feito tudo o que sabia para tentar salvar a sua criação, que era o seu ganha-pão. Aí, numa manhã, ele ligou a televisão e ouviu-me falar sobre a determinação. E, mesmo sem muita orientação, o que na verdade é desnecessário, abriu a porta da cozinha e foi ao quintal, onde gritou com a mão levantada: 'Aqui não vai morrer mais nem porco nem galinha, em Nome de Jesus.' Três meses depois desta sua determinação, ele veio a uma reunião que realizei naquela cidade e contou-me com lágrimas a rolar pela face que nenhuma criação havia morrido mais no seu sítio. É fácil. Pode e deve ocorrer também com você. Quem nos garante é o próprio Senhor Jesus (João 14.13).", items: [] },
          { title: "Aprendendo a Determinar", body: "Determinar é marcar tempo, fixar, definir, prescrever, ordenar, estabelecer, decretar e decidir. Quantas pessoas passam o tempo todo sofrendo, enquanto oram pedindo a Deus que as cure, solucione os seus problemas, salve os pecadores e faça uma porção de coisas? Não sabem que na verdade é o Senhor que tem estado o tempo todo esperando que elas determinassem para que Ele pudesse fazer a obra.", items: [] },
          { title: "Determinar é Exigir de Quem?", body: "É claro que não podemos exigir de Deus. Não podemos mandar que Deus faça isto ou aquilo. Ele é o Senhor e nós servos. Mas, determinar não é ordenar a Deus e sim ao diabo que tire de nós suas garras e desapareça de nossas vidas, de nosso dinheiro e de nossas famílias. Determinar é obedecer ao Senhor. Quando agimos assim, descobrimos que este é o modo de fazer o inimigo nos obedecer. Quando determinamos em o Nome de Jesus, o poder de Deus entra em ação realizando aquilo que queremos.", items: [] },
          { title: "A Simplicidade das Coisas de Deus", body: "Pode parecer simples, mas este é o meio mais rápido e seguro de recebermos as bênçãos do Senhor. Quando começamos a agir por este método de Deus, não somente obedecemos ao Senhor, mas aprendemos que ele realmente funciona. Eu creio que Deus não fez nada complicado. Os homens, sim, é que complicam o que fazem e tentam complicar também as coisas de Deus. Deus na realidade quis que as coisas espirituais fossem assim para que até as crianças, os débeis mentais e gente com raciocínio difícil pudessem receber as Suas bênçãos. As coisas de Deus são sempre simples e descomplicadas.", items: [] },
          { title: "Um Desafio para Quem Crê", body: "Se você determinar em o Nome de Jesus, você pode estar certo de que a sua ordem não falhará. As palavras de Jesus não poderão passar, ainda que o céu e a terra passem. Veja Mateus 24.35. Quando agimos sobre a Palavra de Jesus, podemos ter certeza da vitória. Por mais difícil e desanimadora que a situação possa parecer, usemos a nossa fé e soltemos a declaração do que cremos, determinando o que quisermos. Após termos determinado, podemos descansar, mesmo que os sintomas permaneçam e tudo pareça atestar que não conseguiremos.", items: [] },
          { title: "Você é Quem Realiza a Obra de Deus", body: "Agora que você sabe que é você quem determina, quem fixa os limites, quem diz o que terá ou não, pare de orar chorando, de se lamentar, suplicando que Deus, na Sua bondade, lembre-se de você. Comece a se alegrar na presença do Altíssimo. Ore, sim, não para mendigar a bênção, mas para agradecer por ela, para dizer ao Senhor quão feliz você se encontra ao saber que tudo o que você determinar Ele mesmo fará por você. Agora é como se Deus estivesse lhe mostrando as suas reais possibilidades nEle. É exatamente isto que Ele está fazendo. Você é de Deus, recriado em Cristo Jesus para o sucesso, para uma vida plena, para determinar o que quiser e vencer. Confesse: Posso todas as coisas naquele que me fortalece (Fp 4.13).", items: [] },
          { title: "Exemplos de Pessoas que Determinaram", body: "Na Bíblia encontramos inúmeros exemplos de pessoas que determinaram, se bem que talvez pouco conhecessem este termo, e foram bem sucedidas. Podemos destacar o caso do apóstolo Paulo na cidade de Listra: E estava assentado em Listra certo varão leso dos pés, coxo desde o ventre de sua mãe, o qual nunca tinha andado. Este ouviu falar Paulo, que, fixando nele os olhos, e vendo que tinha fé para ser curado. Disse em voz alta: Levanta-te direito sobre teus pés. E ele saltou e andou (At 14.8-10). Como podemos observar, Paulo não orou para que este cidadão fosse curado. Ele determinou a sua cura. Podemos citar ainda o caso de Josué ordenando que o sol e a lua se detivessem, fazendo com que aquele dia se espichasse por quase mais um dia (Js 10.12).", items: [] }
        ],
        memory: "\"E tudo quanto pedirdes em meu nome, eu o farei, para que o Pai seja glorificado no Filho.\" — João 14:13",
        application: [
          "Tenha uma autovalorização reconhecendo o seu valor em Cristo.",
          "Determine em Nome de Jesus a saída de todo mal da sua vida.",
          "Mesmo que os sintomas persistam, não leve-os em consideração e descanse."
        ]
      },
      {
        num: 2, title: "Os Cinco Passos da Vitória", subtitle: "Princípios para Vencer em Cristo",
        base: "1 Coríntios 15:57", baseText: "\"Mas graças a Deus, que nos dá a vitória por intermédio de nosso Senhor Jesus Cristo.\"",
        objective: "Compreender os passos espirituais necessários para desfrutar da vitória que Cristo conquistou.",
        color: "from-blue-600/20 to-cyan-600/10", border: "border-blue-500/30", icon: "👣",
        sections: [
          { title: "Os 5 Passos Práticos", items: ["1. Aceitar a vitória de Cristo","2. Viver em obediência ativa","3. Declarar a Palavra com fé","4. Vigiar e orar continuamente","5. Permanecer firme em comunidade"] }
        ],
        memory: "\"Graças a Deus, que nos dá a vitória por intermédio de nosso Senhor Jesus Cristo.\" — 1 Coríntios 15:57",
        application: ["Aplique o primeiro passo hoje mesmo.","Agradeça a Deus pela vitória antecipada.","Fale das promessas com autoridade."]
      },
      {
        num: 3, title: "Os Nossos Direitos às Bênçãos", subtitle: "A Herança Legal do Crente",
        base: "Gálatas 3:29", baseText: "\"E, se sois de Cristo, também sois descendentes de Abraão e herdeiros segundo a promessa.\"",
        objective: "Conhecer as promessas da Nova Aliança e tomar posse delas pela fé.",
        color: "from-amber-600/20 to-yellow-600/10", border: "border-amber-500/30", icon: "📜",
        sections: [
          { title: "Qual é a Nossa Herança?", items: ["Adoção como filhos e herdeiros","Acesso direto ao Trono da Graça","Provisão e cuidado em todas as áreas","Paz que excede todo o entendimento"] }
        ],
        memory: "\"E, se sois de Cristo, também sois descendentes de Abraão e herdeiros...\" — Gálatas 3:29",
        application: ["Estude as promessas de Abraão na Bíblia.","Aproprie-se dos seus direitos em Cristo.","Rejeite o sentimento de rejeição."]
      },
      {
        num: 4, title: "O Nome de Jesus", subtitle: "Autoridade e Poder",
        base: "Filipenses 2:9", baseText: "\"Pelo que também Deus o exaltou sobremaneira e lhe deu o nome que está acima de todo nome.\"",
        objective: "Reconhecer a autoridade do nome de Jesus e aprender a usá-lo na oração e na batalha espiritual.",
        color: "from-emerald-600/20 to-teal-600/10", border: "border-emerald-500/30", icon: "👑",
        sections: [
          { title: "O Poder do Nome", items: ["Salvação de pecadores","Poder para expulsar o mal","Autoridade diante das enfermidades","Resposta do Pai aos nossos pedidos"] }
        ],
        memory: "\"E tudo quanto pedirdes em meu nome, isso farei, a fim de que o Pai seja glorificado no Filho.\" — João 14:13",
        application: ["Ore especificamente usando o nome de Jesus com fé.","Reconheça a soberania de Cristo.","Compartilhe o nome dEle hoje."]
      },
      {
        num: 5, title: "A Fórmula da Oração", subtitle: "Orando Conforme a Vontade de Deus",
        base: "Mateus 6:9", baseText: "\"Portanto, vós orareis assim: Pai nosso, que estás nos céus, santificado seja o teu nome.\"",
        objective: "Aprender o padrão de oração ensinado por Jesus e como orar com eficácia.",
        color: "from-rose-600/20 to-pink-600/10", border: "border-rose-500/30", icon: "🧮",
        sections: [
          { title: "Elementos da Oração Eficaz", items: ["Adoração e reconhecimento da paternidade divina","Alinhamento com a vontade do Reino","Pedido de provisão diária (pão nosso)","Pedido de perdão e coração perdoador","Proteção e livramento do mal"] }
        ],
        memory: "\"E esta é a confiança que temos para com ele: que, se pedirmos alguma coisa segundo a sua vontade, ele nos ouve.\" — 1 João 5:14",
        application: ["Use o 'Pai Nosso' como base estrutural.","Evite orar apenas por si mesmo.","Agradeça pelas orações respondidas."]
      },
      {
        num: 6, title: "A Derrota de Satanás", subtitle: "Triunfo Consumado na Cruz",
        base: "Colossenses 2:15", baseText: "\"E, despojando os principados e as potestades, publicamente os expôs ao desprezo, triunfando deles na cruz.\"",
        objective: "Compreender que o inimigo já está derrotado e que o cristão caminha em vitória.",
        color: "from-orange-600/20 to-amber-600/10", border: "border-orange-500/30", icon: "🛡️",
        sections: [
          { title: "A Realidade do Triunfo", items: ["A cruz esmagou a cabeça da serpente","Fomos libertos do império das trevas","A culpa que nos acusava foi cancelada na cruz","Temos autoridade em Jesus para resistir"] }
        ],
        memory: "\"O qual nos libertou do império das trevas e nos transportou para o Reino do Filho do seu amor.\" — Colossenses 1:13",
        application: ["Rejeite mentiras ou acusações do inimigo.","Declare que você pertence ao Reino da Luz.","Ande de cabeça erguida em Cristo."]
      },
      {
        num: 7, title: "Resistir", subtitle: "Firmeza Contra as Investidas do Mal",
        base: "Tiago 4:7", baseText: "\"Sujeitai-vos, portanto, a Deus; mas resisti ao diabo, e ele fugirá de vós.\"",
        objective: "Aprender a se submeter à vontade de Deus para ter autoridade espiritual para resistir.",
        color: "from-violet-600/20 to-purple-600/10", border: "border-violet-500/30", icon: "🧱",
        sections: [
          { title: "Como Resistir?", items: ["1. Submissão total a Deus em primeiro lugar","2. Rejeição ativa e verbal do mal","3. Uso do escudo da fé e espada do Espírito","4. Vigiar as brechas e pensamentos negativos"] }
        ],
        memory: "\"Sujeitai-vos, portanto, a Deus; mas resisti ao diabo, e ele fugirá de vós.\" — Tiago 4:7",
        application: ["Coloque uma área da sua vida sob submissão a Deus.","Feche as brechas da tentação.","Reaja imediatamente aos maus pensamentos com a Bíblia."]
      },
      {
        num: 8, title: "Mais que Vencedores", subtitle: "Identidade Inabalável em Cristo",
        base: "Romanos 8:37", baseText: "\"Em todas estas coisas, porém, somos mais que vencedores, por meio daquele que nos amou.\"",
        objective: "Apropriar-se do amor incondicional de Deus que garante nossa vitória contínua.",
        color: "from-sky-600/20 to-blue-600/10", border: "border-sky-500/30", icon: "🏆",
        sections: [
          { title: "Identidade Inabalável", items: ["Não somos definidos pelas circunstâncias","O amor de Deus nos sustenta nas tribulações","A vitória já foi selada pelo sacrifício de Cristo","Nada pode nos separar do amor de Deus"] }
        ],
        memory: "\"Quem nos separará do amor de Cristo? Será tribulação, ou angústia, ou perseguição...?\" — Romanos 8:35",
        application: ["Agradeça pelo amor incondicional de Deus.","Encare as dificuldades sabendo que a vitória é certa.","Declare sua real identidade em Cristo."]
      },
      {
        num: 9, title: "As Palavras", subtitle: "O Poder do que Falamos",
        base: "Provérbios 18:21", baseText: "\"A morte e a vida estão no poder da língua; o que bem a utiliza come do seu fruto.\"",
        objective: "Reconhecer que nossas palavras devem ser usadas para abençoar e confessar a verdade.",
        color: "from-purple-600/20 to-pink-600/10", border: "border-purple-500/30", icon: "🗣️",
        sections: [
          { title: "A Língua e Seus Frutos", items: ["Palavras de bênção edificam vidas","Palavras negativas geram morte e desânimo","A boca fala do que o coração está cheio","Devemos profetizar vida sobre as situações"] }
        ],
        memory: "\"A morte e a vida estão no poder da língua; o que bem a utiliza come do seu fruto.\" — Provérbios 18:21",
        application: ["Policie seu vocabulário hoje contra murmurações.","Fale palavras de incentivo e bênção para alguém.","Submeta sua fala ao Espírito Santo."]
      },
      {
        num: 10, title: "Confissão", subtitle: "Declarando as Promessas e a Verdade",
        base: "Hebreus 10:23", baseText: "\"Guardemos firme a confissão da nossa esperança, sem vacilar, pois quem fez a promessa é fiel.\"",
        objective: "Aprender a alinha nossa confissão verbal com as Escrituras Sagradas.",
        color: "from-teal-600/20 to-emerald-600/10", border: "border-teal-500/30", icon: "📢",
        sections: [
          { title: "O Que Confessar?", items: ["A fidelidade de Deus e Suas promessas","Nossa dependência e amor pelo Senhor","O arrependimento dos pecados para purificação","A vitória sobre o mal e a cura divina"] }
        ],
        memory: "\"Guardemos firme a confissão da nossa esperança, sem vacilar, pois quem fez a promessa é fiel.\" — Hebreus 10:23",
        application: ["Confesse uma promessa bíblica em voz alta hoje.","Alinhe seus pensamentos e palavras com a Palavra.","Não vacile diante de sentimentos opostos."]
      },
      {
        num: 11, title: "Vãs Repetições", subtitle: "A Oração Sincera vs. Religiosidade",
        base: "Mateus 6:7", baseText: "\"E, orando, não useis de vãs repetições, como os gentios; porque presumem que pelo seu muito falar serão ouvidos.\"",
        objective: "Evitar a religiosidade mecânica na oração e buscar um relacionamento real de filiação com o Pai.",
        color: "from-rose-600/20 to-orange-600/10", border: "border-rose-500/30", icon: "🔄",
        sections: [
          { title: "Relacionamento vs. Ritual", items: ["A oração não é um amuleto ou repetição de palavras","Deus deseja intimidade e diálogo sincero","Falar de coração aberto, com sinceridade","O Pai conhece nossas necessidades de antemão"] }
        ],
        memory: "\"Não sejais, pois, semelhantes a eles; porque o vosso Pai sabe o de que tendes necessidade, antes que lho peçais.\" — Mateus 6:8",
        application: ["Ore com suas próprias palavras de forma transparente.","Dedique tempo para silenciar e ouvir a Deus.","Abandone orações automáticas."]
      },
      {
        num: 12, title: "Realizando a Obra de Deus", subtitle: "O Chamado para o Serviço",
        base: "1 Coríntios 15:58", baseText: "\"Portanto, meus amados irmãos, sede firmes, inabaláveis e sempre abundantes na obra do Senhor.\"",
        objective: "Inspirar o novo discípulo a servir ativamente na edificação do Reino de Deus e assistência ao próximo.",
        color: "from-purple-600/20 to-blue-600/10", border: "border-purple-500/30", icon: "🛠️",
        sections: [
          { title: "Servindo ao Senhor", items: ["Todo crente tem dons espirituais para cooperar","O trabalho feito com amor nunca é em vão","Evangelizar e consolar são partes essenciais da obra","Ser as mãos e os pés de Jesus na terra"] }
        ],
        memory: "\"Portanto, meus amados irmãos, sede firmes, inabaláveis e sempre abundantes na obra do Senhor...\" — 1 Coríntios 15:58",
        application: ["Identifique um talento ou dom que você possa colocar a serviço da igreja.","Apoie voluntariamente uma ação ministerial esta semana.","Faça tudo como para o Senhor."]
      }
    ]
  }
];

export default function Discipleship() {
  const [journeys, setJourneys] = useState<Journey[]>(() => {
    const saved = localStorage.getItem("discipleship_journeys");
    return saved ? JSON.parse(saved) : DEFAULT_JOURNEYS;
  });

  const [activeJourneyId, setActiveJourneyId] = useState<string>(() => {
    return localStorage.getItem("discipleship_active_journey_id") || "integracao";
  });

  useEffect(() => {
    localStorage.setItem("discipleship_journeys", JSON.stringify(journeys));
  }, [journeys]);

  useEffect(() => {
    localStorage.setItem("discipleship_active_journey_id", activeJourneyId);
  }, [activeJourneyId]);

  const activeJourney = journeys.find(j => j.id === activeJourneyId) || journeys[0];
  const lessons = activeJourney.lessons;

  // Form State for creating a new study
  const [isNewStudyModalOpen, setIsNewStudyModalOpen] = useState(false);
  const [studyTitle, setStudyTitle] = useState("");
  const [studySubtitle, setStudySubtitle] = useState("");
  const [studyBase, setStudyBase] = useState("");
  const [studyBaseText, setStudyBaseText] = useState("");
  const [studyObjective, setStudyObjective] = useState("");
  const [studyMemory, setStudyMemory] = useState("");
  const [studyIcon, setStudyIcon] = useState("📖");
  const [studyApp1, setStudyApp1] = useState("");
  const [studyApp2, setStudyApp2] = useState("");
  const [studyApp3, setStudyApp3] = useState("");

  const handleAddStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studyTitle) return;

    const newStudy = {
      num: lessons.length + 1,
      title: studyTitle,
      subtitle: studySubtitle || "Estudo Complementar",
      base: studyBase || "Bíblia Sagrada",
      baseText: studyBaseText || "",
      objective: studyObjective || "Crescimento e edificação espiritual.",
      color: "from-purple-600/20 to-indigo-600/10",
      border: "border-purple-500/30",
      icon: studyIcon || "📖",
      sections: [
        {
          title: "Introdução ao Estudo",
          items: [
            "Meditar no texto base mencionado.",
            "Refletir sobre a aplicação deste tema na vida diária.",
            "Compartilhar aprendizados com seu discipulador."
          ]
        }
      ],
      memory: studyMemory || "Guardo a tua palavra no meu coração. — Salmo 119:11",
      application: [
        studyApp1 || "Colocar em prática o que foi aprendido.",
        studyApp2 || "Dedicar tempo para oração sobre este tema.",
        studyApp3 || "Ajudar outra pessoa com este ensino."
      ].filter(Boolean)
    };

    const updatedJourneys = journeys.map(j => {
      if (j.id === activeJourneyId) {
        return {
          ...j,
          lessons: [...j.lessons, newStudy]
        };
      }
      return j;
    });
    try {
      await persistDiscipleshipState(updatedJourneys, pairs, activeJourneyId);
      setJourneys(updatedJourneys);
    } catch (error) {
      console.warn("Falha ao salvar estudo de discipulado no backend:", error);
      alert("Nao foi possivel salvar o estudo no servidor. Verifique se o backend esta rodando na porta 3001.");
      return;
    }
    setIsNewStudyModalOpen(false);

    // Reset Form
    setStudyTitle("");
    setStudySubtitle("");
    setStudyBase("");
    setStudyBaseText("");
    setStudyObjective("");
    setStudyMemory("");
    setStudyIcon("📖");
    setStudyApp1("");
    setStudyApp2("");
    setStudyApp3("");
  };

  const [expandedLesson, setExpandedLesson] = useState<number | null>(null);
  const [lessonModal, setLessonModal] = useState<number | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<DiscipleshipPair | null>(null);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>(() => {
    const saved = localStorage.getItem("discipleship_course_enrollments");
    return saved ? JSON.parse(saved) : [];
  });
  const [pairs, setPairs] = useState<DiscipleshipPair[]>(() => {
    const saved = localStorage.getItem("discipleship_data");
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        mentor: "Sandra Regina",
        disciple: "Clarice Lima",
        completedLessons: 4,
        totalLessons: 8,
        lastMeeting: "2026-05-14",
        status: "Em Progresso",
      },
      {
        id: 2,
        mentor: "Lucas Rocha",
        disciple: "Rodrigo Alencar",
        completedLessons: 7,
        totalLessons: 8,
        lastMeeting: "2026-05-12",
        status: "Em Progresso",
      },
      {
        id: 3,
        mentor: "Pr. Anderson Silva",
        disciple: "Mateus Santana",
        completedLessons: 8,
        totalLessons: 8,
        lastMeeting: "2026-05-01",
        status: "Concluído",
      },
      {
        id: 4,
        mentor: "Carlos Eduardo",
        disciple: "Eduardo Santos",
        completedLessons: 2,
        totalLessons: 8,
        lastMeeting: "2026-04-20",
        status: "Pausado",
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem("discipleship_data", JSON.stringify(pairs));
  }, [pairs]);

  useEffect(() => {
    localStorage.setItem("discipleship_course_enrollments", JSON.stringify(enrollments));
  }, [enrollments]);

  const persistDiscipleshipState = async (
    nextJourneys = journeys,
    nextPairs = pairs,
    nextActiveJourneyId = activeJourneyId,
    nextEnrollments = enrollments
  ) => {
    await saveServerDiscipleshipState({
      journeys: nextJourneys,
      pairs: nextPairs,
      enrollments: nextEnrollments,
      activeJourneyId: nextActiveJourneyId,
    });
  };

  useEffect(() => {
    const loadRemoteDiscipleship = async () => {
      try {
        const response = await fetchServerDiscipleshipState();
        const state = response?.state;
        const hasServerState = Boolean(
          (state?.journeys && state.journeys.length > 0) ||
          (state?.pairs && state.pairs.length > 0) ||
          (state?.enrollments && state.enrollments.length > 0)
        );

        if (hasServerState) {
          const nextJourneys = state.journeys?.length ? state.journeys : DEFAULT_JOURNEYS;
          const nextPairs = state.pairs || [];
          const nextEnrollments = state.enrollments || [];
          const nextActiveJourneyId = state.activeJourneyId || nextJourneys[0]?.id || "integracao";

          setJourneys(nextJourneys);
          setPairs(nextPairs);
          setEnrollments(nextEnrollments);
          setActiveJourneyId(nextActiveJourneyId);
          localStorage.setItem("discipleship_journeys", JSON.stringify(nextJourneys));
          localStorage.setItem("discipleship_data", JSON.stringify(nextPairs));
          localStorage.setItem("discipleship_course_enrollments", JSON.stringify(nextEnrollments));
          localStorage.setItem("discipleship_active_journey_id", nextActiveJourneyId);
          return;
        }

        await persistDiscipleshipState(journeys, pairs, activeJourneyId);
      } catch (error) {
        console.warn("Nao foi possivel carregar discipulado do servidor:", error);
      }
    };

    loadRemoteDiscipleship();
  }, []);

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.openModal) {
      setIsModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Form State
  const [newMentor, setNewMentor] = useState("");
  const [newDisciple, setNewDisciple] = useState("");
  const [newLessons, setNewLessons] = useState(0);
  const [newStatus, setNewStatus] = useState<DiscipleshipPair["status"]>("Em Progresso");
  const [newJourneyId, setNewJourneyId] = useState("integracao");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isBulkCourseModalOpen, setIsBulkCourseModalOpen] = useState(false);
  const [editingEnrollmentId, setEditingEnrollmentId] = useState<number | null>(null);
  const [coursePair, setCoursePair] = useState<DiscipleshipPair | null>(null);
  const [courseRecipientName, setCourseRecipientName] = useState("");
  const [courseJourneyId, setCourseJourneyId] = useState(activeJourneyId);
  const [coursePhone, setCoursePhone] = useState("");
  const [courseImageUrl, setCourseImageUrl] = useState("");
  const [courseMessage, setCourseMessage] = useState("");
  const [courseLessonNum, setCourseLessonNum] = useState(1);
  const [courseSending, setCourseSending] = useState(false);
  const [bulkCourseTarget, setBulkCourseTarget] = useState<"members" | "visitors">("members");
  const [bulkCourseContacts, setBulkCourseContacts] = useState<CourseBulkContact[]>([]);
  const [bulkCourseSelectedIds, setBulkCourseSelectedIds] = useState<string[]>([]);
  const [bulkCourseLoading, setBulkCourseLoading] = useState(false);
  const [bulkCourseSaving, setBulkCourseSaving] = useState(false);
  const [courseScheduleTarget, setCourseScheduleTarget] = useState<CourseEnrollment | null>(null);
  const [courseScheduleDate, setCourseScheduleDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [courseScheduleTime, setCourseScheduleTime] = useState("08:00");
  const [lastCourseLink, setLastCourseLink] = useState("");
  const [courseRefreshMessage, setCourseRefreshMessage] = useState("");
  const [courseLinkBase, setCourseLinkBase] = useState(() => {
    return typeof window !== "undefined" ? window.location.origin : "";
  });

  const resetForm = () => {
    setNewMentor("");
    setNewDisciple("");
    setNewLessons(0);
    setNewStatus("Em Progresso");
    setNewJourneyId("integracao");
    setEditingId(null);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
    if (!isLocalHost) return;

    let isMounted = true;

    fetchNetworkInfo()
      .then((data) => {
        if (isMounted && data?.frontendUrl) {
          setCourseLinkBase(data.frontendUrl.replace(/\/$/, ""));
        }
      })
      .catch((error) => {
        console.warn("Nao foi possivel carregar o link de rede para o curso:", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const buildCourseLink = (token: string) => {
    const base = courseLinkBase || (typeof window !== "undefined" ? window.location.origin : "");
    return `${base.replace(/\/$/, "")}/course/${token}`;
  };

  const resolveCourseLink = async (token: string) => {
    if (typeof window === "undefined") return buildCourseLink(token);

    const isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
    if (!isLocalHost) return buildCourseLink(token);

    try {
      const data = await fetchNetworkInfo();
      if (data?.frontendUrl) {
        const nextBase = data.frontendUrl.replace(/\/$/, "");
        setCourseLinkBase(nextBase);
        return `${nextBase}/course/${token}`;
      }
    } catch (error) {
      console.warn("Nao foi possivel confirmar o link de rede para o curso:", error);
    }

    return buildCourseLink(token);
  };

  const findMemberPhone = (memberName: string) => {
    try {
      const members = JSON.parse(localStorage.getItem("members_data") || "[]");
      const normalizedName = memberName.trim().toLowerCase();
      const member = members.find((item: any) => String(item.name || "").trim().toLowerCase() === normalizedName);
      return member?.phone || "";
    } catch {
      return "";
    }
  };

  const defaultCourseMessage = `Graca e paz, [NOME]!\n\nEstou enviando a sua aula do discipulado: [CURSO] - [AULA].\n\nLeia o conteudo com atencao e responda a pergunta ao final. Sua resposta sera registrada no acompanhamento do seu crescimento espiritual.\n\nAcesse aqui:\n[LINK]`;

  const normalizeCourseKey = (value?: string) => {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
  };

  const findExistingCourseLesson = (
    name: string,
    phone: string,
    journey: Journey,
    lessonNum: number,
    source: CourseEnrollment[] = enrollments,
    ignoreEnrollmentId?: number | null
  ) => {
    const cleanPhone = String(phone || "").replace(/\D/g, "");
    const cleanName = String(name || "").trim().toLowerCase();
    const journeyIdKey = normalizeCourseKey(journey.id);
    const journeyNameKey = normalizeCourseKey(journey.name);

    return source.find((enrollment) => {
      if (ignoreEnrollmentId && enrollment.id === ignoreEnrollmentId) return false;

      const enrollmentPhone = String(enrollment.memberPhone || "").replace(/\D/g, "");
      const enrollmentName = String(enrollment.memberName || "").trim().toLowerCase();
      const sameStudent = cleanPhone ? enrollmentPhone === cleanPhone : enrollmentName === cleanName;
      const sameCourse =
        normalizeCourseKey(enrollment.journeyId) === journeyIdKey ||
        normalizeCourseKey(enrollment.journeyName) === journeyNameKey;
      const sameLesson = Number(enrollment.lessonNum || 0) === Number(lessonNum || 0);

      return sameStudent && sameCourse && sameLesson;
    });
  };

  const normalizeBulkContacts = (items: any[], type: CourseBulkContact["type"]): CourseBulkContact[] => {
    const seen = new Set<string>();

    return items
      .map((item, index) => {
        const name = String(item.name || item.fullName || "").trim();
        const phone = String(item.phone || item.whatsapp || "").trim();
        const cleanPhone = phone.replace(/\D/g, "");
        const id = `${type}-${item.id || cleanPhone || name || index}`;
        return { id, name, phone, type };
      })
      .filter((contact) => {
        if (!contact.name || !contact.phone) return false;
        const key = contact.phone.replace(/\D/g, "") || contact.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  };

  const readCachedBulkContacts = (target: "members" | "visitors") => {
    const key = target === "members" ? "members_data" : "visitors_data";
    const type = target === "members" ? "member" : "visitor";

    try {
      const cached = JSON.parse(localStorage.getItem(key) || "[]");
      return normalizeBulkContacts(Array.isArray(cached) ? cached : [], type);
    } catch {
      return [];
    }
  };

  const loadBulkCourseContacts = async (target: "members" | "visitors") => {
    setBulkCourseLoading(true);
    setBulkCourseContacts(readCachedBulkContacts(target));
    setBulkCourseSelectedIds([]);

    try {
      const records = target === "members"
        ? (await fetchServerMembers())?.members || []
        : (await fetchServerVisitors())?.visitors || [];
      const contacts = normalizeBulkContacts(records, target === "members" ? "member" : "visitor");
      setBulkCourseContacts(contacts);
      setBulkCourseSelectedIds(contacts.map((contact) => contact.id));
    } catch (error) {
      console.warn("Nao foi possivel carregar lista para envio de curso:", error);
      const cached = readCachedBulkContacts(target);
      setBulkCourseContacts(cached);
      setBulkCourseSelectedIds(cached.map((contact) => contact.id));
    } finally {
      setBulkCourseLoading(false);
    }
  };

  const openCourseSendModal = (pair?: DiscipleshipPair) => {
    const selectedJourneyId = pair?.journeyId || activeJourneyId;
    const pairJourney = journeys.find((journey) => journey.id === selectedJourneyId) || activeJourney;
    const nextLessonNum = Math.min(Number(pair?.completedLessons || 0) + 1, pairJourney.lessons.length || 1);

    setCoursePair(pair || null);
    setEditingEnrollmentId(null);
    setCourseRecipientName(pair?.disciple || "");
    setCoursePhone(pair ? findMemberPhone(pair.disciple) : "");
    setCourseJourneyId(pairJourney.id);
    setCourseImageUrl("");
    setCourseLessonNum(nextLessonNum);
    setCourseMessage(defaultCourseMessage);
    setLastCourseLink("");
    setIsCourseModalOpen(true);
  };

  const openBulkCourseModal = async (target: "members" | "visitors" = "members") => {
    const journey = journeys.find((item) => item.id === activeJourneyId) || activeJourney;
    setEditingEnrollmentId(null);
    setCoursePair(null);
    setCourseJourneyId(journey.id);
    setCourseLessonNum(Number(journey.lessons[0]?.num || 1));
    setCourseImageUrl("");
    setCourseMessage(defaultCourseMessage);
    setBulkCourseTarget(target);
    setIsBulkCourseModalOpen(true);
    await loadBulkCourseContacts(target);
  };

  const closeBulkCourseModal = () => {
    setIsBulkCourseModalOpen(false);
    setBulkCourseContacts([]);
    setBulkCourseSelectedIds([]);
    setBulkCourseSaving(false);
  };

  const closeCourseModal = () => {
    setIsCourseModalOpen(false);
    setCoursePair(null);
    setEditingEnrollmentId(null);
    setCourseRecipientName("");
    setCoursePhone("");
    setCourseImageUrl("");
    setCourseMessage("");
    setLastCourseLink("");
  };

  const renderCourseMessage = (enrollment: CourseEnrollment, courseLink: string) => {
    const template = enrollment.courseMessage?.trim() || defaultCourseMessage;
    const imageLine = enrollment.courseImageUrl && !enrollment.courseImageUrl.startsWith("data:")
      ? `\n\nImagem do curso:\n${enrollment.courseImageUrl}`
      : enrollment.courseImageUrl
      ? "\n\nA imagem do curso estara disponivel quando voce abrir o link da aula."
      : "";

    return template
      .replace(/\[NOME\]/g, enrollment.memberName)
      .replace(/\[CURSO\]/g, enrollment.journeyName)
      .replace(/\[AULA\]/g, `Licao ${enrollment.lessonNum}: ${enrollment.lessonTitle}`)
      .replace(/\[LINK\]/g, courseLink) + imageLine;
  };

  const sendCourseEnrollment = async (enrollment: CourseEnrollment, options?: { allowWhatsAppWeb?: boolean }) => {
    const courseLink = await resolveCourseLink(enrollment.token);
    const message = renderCourseMessage(enrollment, courseLink);
    setEnrollments((current) =>
      current.map((item) =>
        item.id === enrollment.id ? { ...item, status: "Enviando", error: undefined } : item
      )
    );

    const result = await sendWhatsAppMessage(enrollment.memberPhone, message, enrollment.courseImageUrl || undefined);

    if (!result.success && options?.allowWhatsAppWeb) {
      const cleanPhone = enrollment.memberPhone.replace(/\D/g, "");
      const finalPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
      window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`, "_blank");

      const nextEnrollments = enrollments.map((item) =>
        item.id === enrollment.id
          ? {
              ...item,
              status: "Enviado Web",
              sentAt: new Date().toISOString(),
              error: enrollment.courseImageUrl ? "WhatsApp Web abriu sem anexo de imagem." : undefined,
            }
          : item
      );
      setEnrollments(nextEnrollments);
      localStorage.setItem("discipleship_course_enrollments", JSON.stringify(nextEnrollments));
      await persistDiscipleshipState(journeys, pairs, activeJourneyId, nextEnrollments);
      return;
    }

    if (!result.success) {
      if (options?.allowWhatsAppWeb) {
        throw new Error(result.error || "Falha no envio pela API. WhatsApp Web foi aberto sem imagem.");
      }

      const errorMessage = result.error || "Falha no envio automatico do curso.";
      const nextEnrollments = enrollments.map((item) =>
        item.id === enrollment.id ? { ...item, status: "Erro no envio", error: errorMessage } : item
      );
      setEnrollments(nextEnrollments);
      localStorage.setItem("discipleship_course_enrollments", JSON.stringify(nextEnrollments));
      await persistDiscipleshipState(journeys, pairs, activeJourneyId, nextEnrollments);
      throw new Error(errorMessage);
    }

    const nextStatus = result.success ? "Enviado" : "Erro no envio";
    let currentEnrollments = enrollments;
    try {
      const stored = JSON.parse(localStorage.getItem("discipleship_course_enrollments") || "[]");
      if (Array.isArray(stored) && stored.length) currentEnrollments = stored;
    } catch {}

    const nextEnrollments = currentEnrollments.map((item) =>
      item.id === enrollment.id
        ? {
            ...item,
            status: nextStatus,
            sentAt: result.success ? new Date().toISOString() : item.sentAt,
            error: result.success ? undefined : result.error || "Falha no envio.",
          }
        : item
    );

    setEnrollments(nextEnrollments);
    localStorage.setItem("discipleship_course_enrollments", JSON.stringify(nextEnrollments));
    await persistDiscipleshipState(journeys, pairs, activeJourneyId, nextEnrollments);

    if (!result.success) {
      throw new Error(result.error || "Falha no envio.");
    }
  };

  const handleSendCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseRecipientName.trim() || !coursePhone.trim()) return;

    const pairJourney = journeys.find((journey) => journey.id === courseJourneyId) || activeJourney;
    const lesson = pairJourney.lessons.find((item: any) => Number(item.num) === Number(courseLessonNum)) || pairJourney.lessons[0];
    const selectedLessonNum = Number(lesson?.num || courseLessonNum || 1);
    const existingEnrollment = findExistingCourseLesson(
      courseRecipientName.trim(),
      coursePhone.trim(),
      pairJourney,
      selectedLessonNum,
      enrollments,
      editingEnrollmentId
    );

    if (existingEnrollment) {
      alert("Este aluno ja possui este curso e esta mesma licao cadastrados. Para continuar, escolha a proxima licao do curso.");
      return;
    }

    setCourseSending(true);
    try {
      if (editingEnrollmentId) {
        const updatedEnrollments = enrollments.map((enrollment) =>
          enrollment.id === editingEnrollmentId
            ? {
                ...enrollment,
                memberName: courseRecipientName.trim(),
                memberPhone: coursePhone.trim(),
                journeyId: pairJourney.id,
                journeyName: pairJourney.name,
                lessonNum: selectedLessonNum,
                lessonTitle: lesson?.title || "Aula",
                courseImageUrl,
                courseMessage,
                totalLessons: pairJourney.lessons.length,
              }
            : enrollment
        );
        setEnrollments(updatedEnrollments);
        localStorage.setItem("discipleship_course_enrollments", JSON.stringify(updatedEnrollments));
        await persistDiscipleshipState(journeys, pairs, activeJourneyId, updatedEnrollments);
        setCourseRefreshMessage("Curso enviado atualizado.");
        window.setTimeout(() => setCourseRefreshMessage(""), 2500);
        closeCourseModal();
        return;
      }

      const response = await createServerDiscipleshipEnrollment({
        memberName: courseRecipientName.trim(),
        memberPhone: coursePhone,
        journeyId: pairJourney.id,
        lessonNum: selectedLessonNum,
        courseImageUrl,
        courseMessage,
        pairId: coursePair?.id,
      });

      const enrollment = {
        ...response.enrollment,
        status: "Preparado",
        courseMessage,
        courseImageUrl,
        totalLessons: pairJourney.lessons.length,
      };
      const courseLink = await resolveCourseLink(enrollment.token);

      const nextEnrollments = [enrollment, ...enrollments];
      setEnrollments(nextEnrollments);
      setLastCourseLink(courseLink);
      localStorage.setItem("discipleship_course_enrollments", JSON.stringify(nextEnrollments));
      await persistDiscipleshipState(journeys, pairs, activeJourneyId, nextEnrollments);
      setCourseRefreshMessage("Aluno e curso salvos. Agora agende o envio.");
      closeCourseModal();
    } catch (error: any) {
      console.warn("Falha ao enviar curso de discipulado:", error);
      alert(error.message || "Nao foi possivel enviar o curso.");
    } finally {
      setCourseSending(false);
    }
  };

  const handleCreateBulkCourses = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedContacts = bulkCourseContacts.filter((contact) => bulkCourseSelectedIds.includes(contact.id));

    if (selectedContacts.length === 0) {
      alert("Selecione pelo menos uma pessoa da lista.");
      return;
    }

    const pairJourney = journeys.find((journey) => journey.id === courseJourneyId) || activeJourney;
    const lesson = pairJourney.lessons.find((item: any) => Number(item.num) === Number(courseLessonNum)) || pairJourney.lessons[0];
    const selectedLessonNum = Number(lesson?.num || courseLessonNum || 1);

    setBulkCourseSaving(true);
    try {
      const createdEnrollments: CourseEnrollment[] = [];
      let skippedDuplicates = 0;

      for (const contact of selectedContacts) {
        const existingEnrollment = findExistingCourseLesson(
          contact.name,
          contact.phone,
          pairJourney,
          selectedLessonNum,
          [...createdEnrollments, ...enrollments]
        );

        if (existingEnrollment) {
          skippedDuplicates += 1;
          continue;
        }

        const response = await createServerDiscipleshipEnrollment({
          memberName: contact.name,
          memberPhone: contact.phone,
          journeyId: pairJourney.id,
          lessonNum: selectedLessonNum,
          courseImageUrl,
          courseMessage,
        });

        createdEnrollments.push({
          ...response.enrollment,
          status: "Preparado",
          courseMessage,
          courseImageUrl,
          totalLessons: pairJourney.lessons.length,
        });
      }

      if (createdEnrollments.length === 0) {
        setCourseRefreshMessage("Nenhum curso novo foi preparado. Todos os selecionados ja tinham esta licao.");
        window.setTimeout(() => setCourseRefreshMessage(""), 4000);
        alert("Nenhum curso novo foi criado, porque todos os selecionados ja possuem este curso e esta mesma licao.");
        return;
      }

      const nextEnrollments = [...createdEnrollments, ...enrollments];
      setEnrollments(nextEnrollments);
      localStorage.setItem("discipleship_course_enrollments", JSON.stringify(nextEnrollments));
      await persistDiscipleshipState(journeys, pairs, activeJourneyId, nextEnrollments);
      const duplicateMessage = skippedDuplicates > 0
        ? ` ${skippedDuplicates} ignorado(s) porque ja tinham esta licao.`
        : "";
      setCourseRefreshMessage(`${createdEnrollments.length} curso(s) preparados para ${bulkCourseTarget === "members" ? "membros" : "visitantes"}.${duplicateMessage}`);
      window.setTimeout(() => setCourseRefreshMessage(""), 3500);
      closeBulkCourseModal();
    } catch (error: any) {
      console.warn("Falha ao criar cursos em lote:", error);
      alert(error.message || "Nao foi possivel criar os cursos para a lista.");
    } finally {
      setBulkCourseSaving(false);
    }
  };

  const refreshCourseAnswers = async (silent = false) => {
    try {
      const response = await fetchServerDiscipleshipState();
      const state = response?.state;
      const nextEnrollments = state?.enrollments || [];
      const nextPairs = state?.pairs || pairs;

      setEnrollments(nextEnrollments);
      setPairs(nextPairs);
      localStorage.setItem("discipleship_course_enrollments", JSON.stringify(nextEnrollments));
      localStorage.setItem("discipleship_data", JSON.stringify(nextPairs));
      if (!silent) {
        setCourseRefreshMessage("Respostas atualizadas.");
        window.setTimeout(() => setCourseRefreshMessage(""), 2500);
      }
    } catch (error) {
      console.warn("Falha ao atualizar respostas dos cursos:", error);
      if (!silent) {
        setCourseRefreshMessage("Nao foi possivel atualizar agora.");
        window.setTimeout(() => setCourseRefreshMessage(""), 3000);
      }
    }
  };

  const editCourseEnrollment = (enrollment: CourseEnrollment) => {
    const selectedJourney = journeys.find((journey) => journey.id === enrollment.journeyId) || activeJourney;
    setEditingEnrollmentId(enrollment.id);
    setCoursePair(null);
    setCourseRecipientName(enrollment.memberName || "");
    setCoursePhone(enrollment.memberPhone || "");
    setCourseJourneyId(selectedJourney.id);
    setCourseLessonNum(Number(enrollment.lessonNum || 1));
    setCourseImageUrl(enrollment.courseImageUrl || "");
    setCourseMessage(enrollment.courseMessage || defaultCourseMessage);
    setLastCourseLink(enrollment.token ? buildCourseLink(enrollment.token) : "");
    setIsCourseModalOpen(true);
  };

  const deleteCourseEnrollment = async (id: number) => {
    if (!window.confirm("Deseja excluir este aluno dos cursos enviados?")) return;

    const nextEnrollments = enrollments.filter((enrollment) => enrollment.id !== id);
    setEnrollments(nextEnrollments);
    localStorage.setItem("discipleship_course_enrollments", JSON.stringify(nextEnrollments));

    try {
      await persistDiscipleshipState(journeys, pairs, activeJourneyId, nextEnrollments);
    } catch (error) {
      console.warn("Falha ao excluir curso enviado no servidor:", error);
      alert("Curso removido localmente, mas nao foi possivel sincronizar com o servidor.");
    }
  };

  const findEnrollmentJourney = (enrollment: CourseEnrollment) => {
    const journeyKey = normalizeCourseKey(enrollment.journeyId);
    const journeyNameKey = normalizeCourseKey(enrollment.journeyName);

    return journeys.find((item) => {
      return normalizeCourseKey(item.id) === journeyKey || normalizeCourseKey(item.name) === journeyNameKey;
    }) || DEFAULT_JOURNEYS.find((item) => {
      return normalizeCourseKey(item.id) === journeyKey || normalizeCourseKey(item.name) === journeyNameKey;
    });
  };

  const getEnrollmentTotalLessons = (enrollment: CourseEnrollment) => {
    const journey = findEnrollmentJourney(enrollment);
    const sameCourseEnrollments = enrollments.filter((item) => {
      return (
        normalizeCourseKey(item.journeyId) === normalizeCourseKey(enrollment.journeyId) ||
        normalizeCourseKey(item.journeyName) === normalizeCourseKey(enrollment.journeyName)
      );
    });
    const highestKnownLesson = sameCourseEnrollments.reduce((highest, item) => {
      return Math.max(highest, Number(item.lessonNum || 0));
    }, Number(enrollment.lessonNum || 0));

    return Number(enrollment.totalLessons || journey?.lessons.length || highestKnownLesson || 0);
  };

  const isEnrollmentCompleted = (enrollment: CourseEnrollment) => {
    return enrollment.status === "Concluido" || enrollment.attendance === "Presente" || Boolean(enrollment.completedAt);
  };

  const getStudentCourseKey = (enrollment: CourseEnrollment) => {
    const cleanPhone = String(enrollment.memberPhone || "").replace(/\D/g, "");
    const cleanName = String(enrollment.memberName || "").trim().toLowerCase();
    const studentKey = cleanPhone || cleanName;
    const courseKey = normalizeCourseKey(enrollment.journeyId) || normalizeCourseKey(enrollment.journeyName);

    return `${studentKey}-${courseKey}`;
  };

  const getDisplayEnrollmentForCourse = (courseEnrollments: CourseEnrollment[]) => {
    const sorted = [...courseEnrollments].sort((a, b) => {
      const lessonDiff = Number(a.lessonNum || 0) - Number(b.lessonNum || 0);
      if (lessonDiff !== 0) return lessonDiff;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
    const nextPending = sorted.find((item) => !isEnrollmentCompleted(item));

    return nextPending || sorted[sorted.length - 1];
  };

  const getGroupedCourseEnrollments = () => {
    const groups = new Map<string, CourseEnrollment[]>();

    enrollments.forEach((enrollment) => {
      const key = getStudentCourseKey(enrollment);
      const current = groups.get(key) || [];
      current.push(enrollment);
      groups.set(key, current);
    });

    return Array.from(groups.values())
      .map(getDisplayEnrollmentForCourse)
      .filter(Boolean)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  };

  const getEnrollmentLessonProgress = (enrollment: CourseEnrollment) => {
    const totalLessons = getEnrollmentTotalLessons(enrollment);
    const journey = findEnrollmentJourney(enrollment);
    const cleanPhone = String(enrollment.memberPhone || "").replace(/\D/g, "");
    const cleanName = String(enrollment.memberName || "").trim().toLowerCase();
    const journeyKey = normalizeCourseKey(enrollment.journeyId);
    const journeyNameKey = normalizeCourseKey(enrollment.journeyName);

    const sameStudentCourse = enrollments.filter((item) => {
      const itemPhone = String(item.memberPhone || "").replace(/\D/g, "");
      const itemName = String(item.memberName || "").trim().toLowerCase();
      const sameCourse =
        normalizeCourseKey(item.journeyId) === journeyKey ||
        normalizeCourseKey(item.journeyName) === journeyNameKey;

      return (
        sameCourse &&
        (cleanPhone ? itemPhone === cleanPhone : itemName === cleanName)
      );
    });

    return Array.from({ length: totalLessons }, (_, index) => {
      const lessonNum = index + 1;
      const lesson = journey?.lessons.find((item: any) => Number(item.num) === lessonNum);
      const lessonEnrollments = sameStudentCourse.filter((item) => Number(item.lessonNum || 0) === lessonNum);
      const completed = lessonEnrollments.some(isEnrollmentCompleted);

      return {
        lessonNum,
        title: lesson?.title || `Licao ${lessonNum}`,
        completed,
      };
    });
  };

  const prepareNextLessonEnrollment = async (enrollment: CourseEnrollment) => {
    const totalLessons = getEnrollmentTotalLessons(enrollment);
    const nextLessonNum = Number(enrollment.lessonNum || 0) + 1;

    if (!totalLessons || nextLessonNum > totalLessons) return;

    const journey = journeys.find((item) => item.id === enrollment.journeyId) || activeJourney;
    const nextLesson = journey.lessons.find((lesson: any) => Number(lesson.num) === nextLessonNum) || journey.lessons[0];

    try {
      const response = await createServerDiscipleshipEnrollment({
        memberName: enrollment.memberName,
        memberPhone: enrollment.memberPhone,
        journeyId: journey.id,
        lessonNum: Number(nextLesson?.num || nextLessonNum),
        courseImageUrl: "",
        courseMessage: defaultCourseMessage,
        pairId: enrollment.pairId || undefined,
      });

      const nextEnrollment: CourseEnrollment = {
        ...response.enrollment,
        status: "Preparado",
        courseMessage: defaultCourseMessage,
        totalLessons: journey.lessons.length,
      };

      const nextEnrollments = [nextEnrollment, ...enrollments];
      setEnrollments(nextEnrollments);
      localStorage.setItem("discipleship_course_enrollments", JSON.stringify(nextEnrollments));
      await persistDiscipleshipState(journeys, pairs, activeJourneyId, nextEnrollments);
      setCourseRefreshMessage(`Proxima licao preparada para ${enrollment.memberName}.`);
      window.setTimeout(() => setCourseRefreshMessage(""), 3000);
    } catch (error: any) {
      console.warn("Falha ao preparar proxima licao:", error);
      alert(error.message || "Nao foi possivel preparar a proxima licao.");
    }
  };

  const openCourseScheduleModal = (enrollment: CourseEnrollment) => {
    setCourseScheduleTarget(enrollment);
    setCourseScheduleDate(enrollment.dispatchDate || new Date().toISOString().slice(0, 10));
    setCourseScheduleTime(enrollment.dispatchTime || "08:00");
  };

  const saveCourseSchedule = async () => {
    if (!courseScheduleTarget) return;
    if (!courseScheduleDate || !courseScheduleTime) {
      alert("Informe data e horario do envio.");
      return;
    }

    const nextEnrollments = enrollments.map((enrollment) =>
      enrollment.id === courseScheduleTarget.id
        ? {
            ...enrollment,
            dispatchDate: courseScheduleDate,
            dispatchTime: courseScheduleTime,
            status: "Agendado",
            error: undefined,
          }
        : enrollment
    );

    setEnrollments(nextEnrollments);
    localStorage.setItem("discipleship_course_enrollments", JSON.stringify(nextEnrollments));
    await persistDiscipleshipState(journeys, pairs, activeJourneyId, nextEnrollments);
    setCourseScheduleTarget(null);
    setCourseRefreshMessage("Envio do curso agendado.");
    window.setTimeout(() => setCourseRefreshMessage(""), 2500);
  };

  const handleCourseImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const image = await compressImageFile(file, {
        maxWidth: 1200,
        maxHeight: 700,
        initialQuality: 0.82,
      });

      if (dataUrlSize(image) > 1_200_000) {
        alert("A imagem ficou muito grande. Tente outra imagem menor.");
        return;
      }

      setCourseImageUrl(image);
    } catch (error) {
      console.error(error);
      alert("Nao foi possivel processar a imagem do curso.");
    } finally {
      event.target.value = "";
    }
  };

  useEffect(() => {
    const processDueCourseSchedules = async () => {
      const now = new Date();
      const dueEnrollments = enrollments.filter((enrollment) => {
        if (enrollment.status !== "Agendado") return false;
        if (!enrollment.dispatchDate || !enrollment.dispatchTime) return false;
        const scheduledAt = new Date(`${enrollment.dispatchDate}T${enrollment.dispatchTime}:00`);
        return scheduledAt <= now;
      });

      for (const enrollment of dueEnrollments) {
        try {
          await sendCourseEnrollment(enrollment);
        } catch (error) {
          console.warn("Falha ao enviar curso agendado:", error);
        }
      }
    };

    processDueCourseSchedules();
    const interval = window.setInterval(processDueCourseSchedules, 30 * 1000);
    return () => window.clearInterval(interval);
  }, [enrollments, courseLinkBase]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      refreshCourseAnswers(true);
    }, 30000);

    return () => window.clearInterval(interval);
  }, [pairs]);

  const handleAddPair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMentor || !newDisciple) return;

    const selectedJourney = journeys.find(j => j.id === newJourneyId) || journeys[0];
    const totalCount = selectedJourney.lessons.length;

    if (editingId) {
      const updatedPairs = pairs.map(p => 
        p.id === editingId ? {
          ...p,
          mentor: newMentor,
          disciple: newDisciple,
          completedLessons: Number(newLessons),
          status: newStatus,
          journeyId: newJourneyId,
          totalLessons: totalCount
        } : p
      );
      try {
        await persistDiscipleshipState(journeys, updatedPairs, activeJourneyId);
        setPairs(updatedPairs);
      } catch (error) {
        console.warn("Falha ao atualizar dupla de discipulado no backend:", error);
        alert("Nao foi possivel salvar a dupla no servidor. Verifique se o backend esta rodando na porta 3001.");
        return;
      }
    } else {
      const newPair: DiscipleshipPair = {
        id: Date.now(),
        mentor: newMentor,
        disciple: newDisciple,
        completedLessons: Number(newLessons),
        totalLessons: totalCount,
        lastMeeting: new Date().toISOString().split("T")[0],
        status: newStatus,
        journeyId: newJourneyId
      };
      const updatedPairs = [newPair, ...pairs];
      try {
        await persistDiscipleshipState(journeys, updatedPairs, activeJourneyId);
        setPairs(updatedPairs);
      } catch (error) {
        console.warn("Falha ao salvar dupla de discipulado no backend:", error);
        alert("Nao foi possivel salvar a dupla no servidor. Verifique se o backend esta rodando na porta 3001.");
        return;
      }
    }

    setIsModalOpen(false);
    resetForm();
  };

  const openEditModal = (pair: DiscipleshipPair) => {
    setNewMentor(pair.mentor);
    setNewDisciple(pair.disciple);
    setNewLessons(pair.completedLessons);
    setNewStatus(pair.status);
    setNewJourneyId(pair.journeyId || "integracao");
    setEditingId(pair.id);
    setIsModalOpen(true);
  };

  const handleDeletePair = async (id: number) => {
    const updatedPairs = pairs.filter((p) => p.id !== id);
    try {
      await persistDiscipleshipState(journeys, updatedPairs, activeJourneyId);
      setPairs(updatedPairs);
    } catch (error) {
      console.warn("Falha ao deletar dupla de discipulado no backend:", error);
      alert("Nao foi possivel deletar a dupla no servidor. Verifique se o backend esta rodando na porta 3001.");
    }
  };

  const handleScheduleMeeting = async (id: number) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const updatedPairs = pairs.map((p) => {
        if (p.id === id) {
          return { ...p, lastMeeting: todayStr };
        }
        return p;
      });
    try {
      await persistDiscipleshipState(journeys, updatedPairs, activeJourneyId);
      setPairs(updatedPairs);
      alert(`Encontro pastoral registrado com sucesso para hoje (${new Date().toLocaleDateString("pt-BR")})!`);
    } catch (error) {
      console.warn("Falha ao salvar encontro de discipulado no backend:", error);
      alert("Nao foi possivel salvar o encontro no servidor. Verifique se o backend esta rodando na porta 3001.");
    }
  };

  const handleIncrementLesson = async (id: number) => {
    const updatedPairs = pairs.map((p) => {
        if (p.id === id) {
          const nextLessons = Math.min(p.completedLessons + 1, p.totalLessons);
          const nextStatus = nextLessons === p.totalLessons ? "Concluído" : p.status;
          const todayStr = new Date().toISOString().split("T")[0];
          return {
            ...p,
            completedLessons: nextLessons,
            status: nextStatus,
            lastMeeting: todayStr
          };
        }
        return p;
      });
    try {
      await persistDiscipleshipState(journeys, updatedPairs, activeJourneyId);
      setPairs(updatedPairs);
    } catch (error) {
      console.warn("Falha ao atualizar licao de discipulado no backend:", error);
      alert("Nao foi possivel salvar o progresso no servidor. Verifique se o backend esta rodando na porta 3001.");
    }
  };

  const filteredPairs = pairs.filter(
    (p) =>
      p.mentor.toLowerCase().includes(search.toLowerCase()) ||
      p.disciple.toLowerCase().includes(search.toLowerCase())
  );
  const libraryBookPalette = [
    "from-red-950 via-red-800 to-red-950 border-red-700/60",
    "from-amber-950 via-amber-700 to-yellow-950 border-amber-600/60",
    "from-emerald-950 via-emerald-700 to-emerald-950 border-emerald-600/60",
    "from-cyan-950 via-cyan-700 to-slate-950 border-cyan-600/60",
    "from-indigo-950 via-indigo-700 to-indigo-950 border-indigo-600/60",
    "from-purple-950 via-purple-700 to-purple-950 border-purple-600/60",
    "from-rose-950 via-rose-700 to-rose-950 border-rose-600/60",
    "from-zinc-900 via-stone-700 to-zinc-950 border-stone-500/60",
  ];
  const selectedLibraryLesson = expandedLesson !== null
    ? lessons.find((lesson) => lesson.num === expandedLesson)
    : null;
  const groupedCourseEnrollments = getGroupedCourseEnrollments();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Discipulado</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Gerencie o acompanhamento espiritual de pessoa para pessoa (Mentoria / Consolidação)
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative group">
            <button
              className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-zinc-300 hover:text-emerald-400 px-4 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95"
            >
              <Download size={16} />
              <span>Exportar</span>
            </button>
            <div className="absolute right-0 top-full mt-2 w-52 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <button
                onClick={() => {
                  const csvData = filteredPairs.map((p) => ({
                    mentor: p.mentor,
                    discipulo: p.disciple,
                    licoes: `${p.completedLessons}/${p.totalLessons}`,
                    progresso: `${Math.round((p.completedLessons / p.totalLessons) * 100)}%`,
                    ultimo_encontro: new Date(p.lastMeeting + "T00:00:00").toLocaleDateString("pt-BR"),
                    status: p.status,
                  }));
                  exportToCSV(
                    csvData,
                    [
                      { key: "mentor", label: "Mentor" },
                      { key: "discipulo", label: "Discípulo" },
                      { key: "licoes", label: "Lições" },
                      { key: "progresso", label: "Progresso" },
                      { key: "ultimo_encontro", label: "Último Encontro" },
                      { key: "status", label: "Status" },
                    ],
                    "discipulado_eclesia_crm"
                  );
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-zinc-300 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all"
              >
                <FileSpreadsheet size={16} />
                <span>Baixar CSV (Excel)</span>
              </button>
              <button
                onClick={() => {
                  const pdfData = filteredPairs.map((p) => ({
                    mentor: p.mentor,
                    discipulo: p.disciple,
                    licoes: `${p.completedLessons}/${p.totalLessons}`,
                    progresso: `${Math.round((p.completedLessons / p.totalLessons) * 100)}%`,
                    ultimo_encontro: new Date(p.lastMeeting + "T00:00:00").toLocaleDateString("pt-BR"),
                    status: p.status,
                  }));
                  exportToPDF(
                    pdfData,
                    [
                      { key: "mentor", label: "Mentor" },
                      { key: "discipulo", label: "Discípulo" },
                      { key: "licoes", label: "Lições" },
                      { key: "progresso", label: "Progresso" },
                      { key: "ultimo_encontro", label: "Último Encontro" },
                      { key: "status", label: "Status" },
                    ],
                    "Relatório de Discipulado",
                    "discipulado_eclesia_crm"
                  );
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-zinc-300 hover:bg-purple-500/10 hover:text-purple-400 transition-all border-t border-white/5"
              >
                <FileText size={16} />
                <span>Baixar PDF (Impressão)</span>
              </button>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-purple-500/20 active:scale-95 transition-all"
          >
            <Plus size={18} />
            <span>Vincular Nova Dupla</span>
          </button>
        </div>
      </div>

      {/* Journey Selector Tabs */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-zinc-900/50 p-3 rounded-2xl border border-white/5">
        <div className="flex items-center gap-2">
          <BookOpen className="text-purple-400" size={18} />
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Selecione a Jornada Ativa:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {journeys.map((j) => (
            <button
              key={j.id}
              onClick={async () => {
                try {
                  await persistDiscipleshipState(journeys, pairs, j.id);
                  setActiveJourneyId(j.id);
                } catch (error) {
                  console.warn("Falha ao salvar jornada ativa no backend:", error);
                  alert("Nao foi possivel salvar a jornada ativa no servidor. Verifique se o backend esta rodando na porta 3001.");
                }
              }}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all active:scale-95 cursor-pointer ${
                activeJourneyId === j.id
                  ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/10"
                  : "bg-white/5 border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/10"
              }`}
            >
              {j.name} ({j.lessons.length} Lições)
            </button>
          ))}
        </div>
      </div>

      {/* Discipleship Path Banner — clickable tiles */}
      <div className="glass-card p-6 bg-gradient-to-r from-rose-950/20 to-zinc-950 border border-rose-500/10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-200 flex items-center gap-2">
              <BookOpen className="text-rose-400" size={18} />
              <span>{activeJourney.name} — Clique numa lição para ver o conteúdo</span>
            </h3>
            <p className="text-xs text-zinc-400 italic leading-relaxed max-w-2xl">{activeJourney.description}</p>
          </div>
          <button
            onClick={() => setIsNewStudyModalOpen(true)}
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-300 px-3 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Plus size={14} className="text-purple-400" />
            <span>Adicionar Novo Estudo</span>
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 text-center">
          {lessons.map((lesson) => (
            <button
              key={lesson.num}
              onClick={() => setLessonModal(lesson.num)}
              className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/30 rounded-lg p-2.5 space-y-1 transition-all active:scale-95 group"
            >
              <span className="text-lg block">{lesson.icon}</span>
              <span className="text-[10px] text-zinc-500 group-hover:text-purple-400 font-bold block uppercase transition-colors">Lição 0{lesson.num}</span>
              <span className="text-xs font-semibold text-zinc-300 block truncate">{lesson.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Summary row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-5 border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400">
            <Heart size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Duplas Ativas</p>
            <h4 className="text-2xl font-bold text-white mt-1">
              {pairs.filter((p) => p.status === "Em Progresso").length}
            </h4>
          </div>
        </div>
        <div className="glass-card p-5 border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Concluídos</p>
            <h4 className="text-2xl font-bold text-white mt-1">
              {pairs.filter((p) => p.status === "Concluído").length}
            </h4>
          </div>
        </div>
        <div className="glass-card p-5 border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Média de Conclusão</p>
            <h4 className="text-2xl font-bold text-white mt-1">
              {pairs.length > 0 
                ? `${Math.round((pairs.filter(p => p.status === "Concluído").length / pairs.length) * 100)}%` 
                : "0%"}
            </h4>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 border border-white/5 bg-zinc-950/60">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Send className="text-emerald-400" size={18} />
              <span>Cursos Enviados aos Membros</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-1">Acompanhamento de quem recebeu, abriu e concluiu a avaliação.</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {courseRefreshMessage && (
              <span className="text-xs font-semibold text-cyan-300">{courseRefreshMessage}</span>
            )}
            <button
              type="button"
              onClick={() => openCourseSendModal()}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-200 transition hover:bg-blue-500/20"
            >
              <Send size={13} />
              <span>Enviar curso individual</span>
            </button>
            <button
              type="button"
              onClick={() => openBulkCourseModal("members")}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-200 transition hover:bg-emerald-500/20"
            >
              <Users size={13} />
              <span>Enviar curso para lista</span>
            </button>
            <button
              type="button"
              onClick={() => refreshCourseAnswers(false)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-zinc-300 transition hover:bg-white/10"
            >
              <RefreshCw size={13} />
              <span>Atualizar respostas</span>
            </button>
          </div>
          <span className="text-xs font-bold text-emerald-300">
            {enrollments.filter((item) => item.status === "Concluido").length}/{enrollments.length} concluídos
          </span>
        </div>

        {enrollments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm text-zinc-500">
            Nenhum curso individual enviado ainda.
          </div>
        ) : (
          <div className="grid gap-3">
            {groupedCourseEnrollments.slice(0, 8).map((enrollment) => {
              const courseLink = buildCourseLink(enrollment.token);
              const isCompleted = isEnrollmentCompleted(enrollment);
              const totalLessons = getEnrollmentTotalLessons(enrollment);
              const hasNextLesson = isCompleted && totalLessons > 0 && Number(enrollment.lessonNum || 0) < totalLessons;

              return (
                <div key={getStudentCourseKey(enrollment)} className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{enrollment.memberName}</h4>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                        isCompleted
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                          : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                      }`}>
                        {isCompleted ? "Presente / Concluído" : enrollment.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-400">
                      {enrollment.journeyName} - Aula {enrollment.lessonNum}: {enrollment.lessonTitle}
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500">
                      Enviado em {new Date(enrollment.createdAt).toLocaleString("pt-BR")}
                      {enrollment.completedAt ? ` - respondido em ${new Date(enrollment.completedAt).toLocaleString("pt-BR")}` : ""}
                      {Number(enrollment.totalQuestions) > 0 ? ` - avaliacao ${enrollment.score}/${enrollment.totalQuestions}` : ""}
                      {Number(enrollment.spiritualGrowth) > 0 ? ` - crescimento espiritual ${enrollment.spiritualGrowth}%` : ""}
                      {enrollment.dispatchDate && enrollment.dispatchTime ? ` - envio programado ${new Date(`${enrollment.dispatchDate}T${enrollment.dispatchTime}:00`).toLocaleString("pt-BR")}` : ""}
                      {enrollment.sentAt ? ` - enviado em ${new Date(enrollment.sentAt).toLocaleString("pt-BR")}` : ""}
                      {enrollment.error ? ` - erro: ${enrollment.error}` : ""}
                    </p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                      {getEnrollmentLessonProgress(enrollment).map((lesson) => (
                        <div
                          key={`${enrollment.id}-${lesson.lessonNum}`}
                          className={`rounded-lg border px-3 py-2 text-[11px] font-bold ${
                            lesson.completed
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                              : "border-white/10 bg-white/[0.03] text-zinc-400"
                          }`}
                          title={lesson.title}
                        >
                          Licao {lesson.lessonNum} {lesson.completed ? "Concluida" : "Pendente"}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
                    {hasNextLesson && (
                      <button
                        type="button"
                        onClick={() => prepareNextLessonEnrollment(enrollment)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-xs font-bold text-purple-200 transition hover:bg-purple-500/20"
                      >
                        <BookOpen size={13} />
                        <span>Preparar proxima</span>
                      </button>
                    )}
                    {enrollment.status !== "Concluido" && (
                      <button
                        type="button"
                        onClick={() => openCourseScheduleModal(enrollment)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-200 transition hover:bg-amber-500/20"
                      >
                        <Calendar size={13} />
                        <span>Agendar</span>
                      </button>
                    )}
                    {enrollment.status !== "Concluido" && enrollment.status !== "Enviando" && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await sendCourseEnrollment(enrollment, { allowWhatsAppWeb: true });
                            setCourseRefreshMessage("Curso enviado.");
                            window.setTimeout(() => setCourseRefreshMessage(""), 2500);
                          } catch (error: any) {
                            alert(error.message || "Nao foi possivel enviar o curso.");
                          }
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-200 transition hover:bg-emerald-500/20"
                      >
                        <Send size={13} />
                        <span>Enviar agora</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(courseLink)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-zinc-300 transition hover:bg-white/10"
                    >
                      <Copy size={13} />
                      <span>Copiar link</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => editCourseEnrollment(enrollment)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-200 transition hover:bg-blue-500/20"
                    >
                      <Edit2 size={13} />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCourseEnrollment(enrollment.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-200 transition hover:bg-rose-500/20"
                    >
                      <Trash2 size={13} />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Buscar por mentor ou discípulo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-all"
        />
      </div>

      {/* Discipleship Pairs list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPairs.map((pair) => {
          const progressPercent = Math.round((pair.completedLessons / pair.totalLessons) * 100);
          return (
            <div
              key={pair.id}
              className="glass-card p-6 border border-white/5 bg-gradient-to-br from-zinc-900/60 to-zinc-950/80 relative group hover:border-purple-500/20 transition-all duration-300"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        pair.status === "Em Progresso"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : pair.status === "Concluído"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {pair.status}
                    </span>
                    <span className="text-[10px] text-zinc-500">Último encontro: {new Date(pair.lastMeeting + "T00:00:00").toLocaleDateString("pt-BR")}</span>
                  </div>
                  
                  <div className="mt-2.5">
                    <span className="text-[9px] text-purple-400 font-extrabold bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {journeys.find(j => j.id === (pair.journeyId || "integracao"))?.name || "Jornada de Estudos"}
                    </span>
                  </div>
                  
                  {/* Mentor & Disciple Row */}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="text-zinc-200">
                      <span className="text-xs text-zinc-500 block uppercase font-bold tracking-wider">Mentor</span>
                      <span className="text-sm font-bold">{pair.mentor}</span>
                    </div>
                    <ArrowRight size={16} className="text-zinc-600 mt-4" />
                    <div className="text-zinc-200">
                      <span className="text-xs text-zinc-500 block uppercase font-bold tracking-wider">Discípulo</span>
                      <span className="text-sm font-bold text-purple-400">{pair.disciple}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 ml-4">
                  <button
                    onClick={() => openEditModal(pair)}
                    title="Editar Dupla"
                    className="text-zinc-500 hover:text-blue-400 p-1.5 rounded-lg hover:bg-blue-500/10 transition-all active:scale-90"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeletePair(pair.id)}
                    title="Remover Dupla"
                    className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-all active:scale-90"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-400">Progresso do Estudo</span>
                  <span className="text-purple-400">
                    {pair.completedLessons} / {pair.totalLessons} Lições ({progressPercent}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div
                    style={{ width: `${progressPercent}%` }}
                    className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-500"
                  ></div>
                </div>
              </div>

              <div className="flex gap-2 mt-6 justify-end">
                <button
                  onClick={() => openCourseSendModal(pair)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg transition-all active:scale-95 cursor-pointer"
                >
                  <Send size={12} />
                  <span>Enviar Curso</span>
                </button>
                <button
                  onClick={() => handleScheduleMeeting(pair.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-zinc-300 transition-all active:scale-95 cursor-pointer"
                >
                  <Calendar size={12} />
                  <span>Agenda Encontro</span>
                </button>
                {pair.completedLessons >= pair.totalLessons ? (
                  <button
                    onClick={() => setActiveQuiz(pair)}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg transition-all active:scale-95 cursor-pointer"
                  >
                    <Award size={12} />
                    <span>Avaliação Final</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleIncrementLesson(pair.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/10 hover:border-purple-500/30 text-purple-400 rounded-lg transition-all active:scale-95 cursor-pointer"
                  >
                    <BookOpen size={12} />
                    <span>Atualizar Lição</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {courseScheduleTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="text-amber-400" size={20} />
                <span>Agendar envio do curso</span>
              </h3>
              <button
                onClick={() => setCourseScheduleTarget(null)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Aluno</p>
                <p className="mt-1 text-sm font-bold text-white">{courseScheduleTarget.memberName}</p>
                <p className="mt-1 text-xs text-zinc-400">
                  {courseScheduleTarget.journeyName} - Aula {courseScheduleTarget.lessonNum}: {courseScheduleTarget.lessonTitle}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Data</label>
                  <input
                    type="date"
                    value={courseScheduleDate}
                    onChange={(e) => setCourseScheduleDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Horario</label>
                  <input
                    type="time"
                    value={courseScheduleTime}
                    onChange={(e) => setCourseScheduleTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCourseScheduleTarget(null)}
                  className="px-5 py-2.5 bg-white/5 border border-white/5 text-zinc-400 hover:text-zinc-200 rounded-xl text-sm font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={saveCourseSchedule}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-sm font-bold shadow-lg active:scale-95 transition-all"
                >
                  Salvar agendamento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isBulkCourseModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-up">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="text-emerald-400" size={20} />
                <span>Enviar curso para lista</span>
              </h3>
              <button
                type="button"
                onClick={closeBulkCourseModal}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateBulkCourses} className="p-6 space-y-5">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    setBulkCourseTarget("members");
                    await loadBulkCourseContacts("members");
                  }}
                  className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold transition ${
                    bulkCourseTarget === "members"
                      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
                      : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"
                  }`}
                >
                  <Users size={15} />
                  <span>Membros</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setBulkCourseTarget("visitors");
                    await loadBulkCourseContacts("visitors");
                  }}
                  className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold transition ${
                    bulkCourseTarget === "visitors"
                      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
                      : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"
                  }`}
                >
                  <Heart size={15} />
                  <span>Visitantes</span>
                </button>
              </div>

              <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Curso</label>
                      <select
                        value={courseJourneyId}
                        onChange={(e) => {
                          const journey = journeys.find((item) => item.id === e.target.value) || activeJourney;
                          setCourseJourneyId(journey.id);
                          setCourseLessonNum(Number(journey.lessons[0]?.num || 1));
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer"
                      >
                        {journeys.map((journey) => (
                          <option key={journey.id} value={journey.id} className="bg-zinc-900">
                            {journey.name} ({journey.lessons.length} licoes)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Aula indicada</label>
                      <select
                        value={courseLessonNum}
                        onChange={(e) => setCourseLessonNum(Number(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer"
                      >
                        {(journeys.find((journey) => journey.id === courseJourneyId) || activeJourney).lessons.map((lesson: any) => (
                          <option key={lesson.num} value={lesson.num} className="bg-zinc-900">
                            Aula {lesson.num} - {lesson.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Mensagem do curso</label>
                    <textarea
                      value={courseMessage}
                      onChange={(e) => setCourseMessage(e.target.value)}
                      rows={6}
                      placeholder="Escreva a mensagem que sera enviada junto com o link..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
                    />
                    <p className="mt-2 text-xs text-zinc-500">
                      Use [NOME], [CURSO], [AULA] e [LINK]. Cada aluno recebe o link individual da propria aula.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Imagem do curso</label>
                    {courseImageUrl && (
                      <div className="mb-3 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                        <img
                          src={courseImageUrl}
                          alt="Preview do curso"
                          className="h-40 w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                      <input
                        type="url"
                        value={courseImageUrl.startsWith("data:") ? "" : courseImageUrl}
                        onChange={(e) => setCourseImageUrl(e.target.value)}
                        placeholder="Cole uma URL da imagem, se preferir"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                      />
                      <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2.5 text-sm font-bold text-blue-200 transition hover:bg-blue-500/20">
                        Escolher foto
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleCourseImageFileChange}
                          className="sr-only"
                        />
                      </label>
                    </div>
                    {courseImageUrl && (
                      <button
                        type="button"
                        onClick={() => setCourseImageUrl("")}
                        className="mt-2 text-xs font-semibold text-rose-300 hover:text-rose-200"
                      >
                        Remover imagem
                      </button>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {bulkCourseTarget === "members" ? "Lista de membros" : "Lista de visitantes"}
                      </h4>
                      <p className="mt-1 text-xs text-zinc-500">
                        {bulkCourseSelectedIds.length}/{bulkCourseContacts.length} selecionados
                      </p>
                    </div>
                    {bulkCourseLoading && (
                      <span className="text-xs font-semibold text-cyan-300">Carregando...</span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setBulkCourseSelectedIds(bulkCourseContacts.map((contact) => contact.id))}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-zinc-300 transition hover:bg-white/10"
                    >
                      Selecionar todos
                    </button>
                    <button
                      type="button"
                      onClick={() => setBulkCourseSelectedIds([])}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-zinc-300 transition hover:bg-white/10"
                    >
                      Limpar selecao
                    </button>
                  </div>

                  <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto pr-1">
                    {bulkCourseContacts.length === 0 && !bulkCourseLoading ? (
                      <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-zinc-500">
                        Nenhum contato com WhatsApp encontrado nesta lista.
                      </div>
                    ) : (
                      bulkCourseContacts.map((contact) => {
                        const checked = bulkCourseSelectedIds.includes(contact.id);

                        return (
                          <label
                            key={contact.id}
                            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 transition ${
                              checked
                                ? "border-emerald-500/30 bg-emerald-500/10"
                                : "border-white/10 bg-black/20 hover:bg-white/[0.06]"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                setBulkCourseSelectedIds((current) => {
                                  if (e.target.checked) return Array.from(new Set([...current, contact.id]));
                                  return current.filter((id) => id !== contact.id);
                                });
                              }}
                              className="h-4 w-4 accent-emerald-500"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-white">{contact.name}</p>
                              <p className="truncate text-xs text-zinc-500">{contact.phone}</p>
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={closeBulkCourseModal}
                  className="px-5 py-2.5 bg-white/5 border border-white/5 text-zinc-400 hover:text-zinc-200 rounded-xl text-sm font-semibold transition-all"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={bulkCourseSaving || bulkCourseLoading || bulkCourseSelectedIds.length === 0}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white rounded-xl text-sm font-semibold shadow-lg active:scale-95 transition-all"
                >
                  {bulkCourseSaving ? "Preparando..." : `Preparar ${bulkCourseSelectedIds.length} curso(s)`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCourseModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-up">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Send className="text-blue-400" size={20} />
                <span>{editingEnrollmentId ? "Editar Curso" : "Cadastrar aluno e curso"}</span>
              </h3>
              <button
                onClick={closeCourseModal}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSendCourse} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Nome do aluno</label>
                <input
                  type="text"
                  required
                  value={courseRecipientName}
                  onChange={(e) => setCourseRecipientName(e.target.value)}
                  placeholder="Ex: Maria Souza"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">WhatsApp do aluno</label>
                <input
                  type="text"
                  required
                  value={coursePhone}
                  onChange={(e) => setCoursePhone(e.target.value)}
                  placeholder="Ex: (11) 99999-8888"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Curso</label>
                <select
                  value={courseJourneyId}
                  onChange={(e) => {
                    const journey = journeys.find((item) => item.id === e.target.value) || activeJourney;
                    setCourseJourneyId(journey.id);
                    setCourseLessonNum(Number(journey.lessons[0]?.num || 1));
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  {journeys.map((journey) => (
                    <option key={journey.id} value={journey.id} className="bg-zinc-900">
                      {journey.name} ({journey.lessons.length} licoes)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Aula indicada</label>
                <select
                  value={courseLessonNum}
                  onChange={(e) => setCourseLessonNum(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  {(journeys.find((journey) => journey.id === courseJourneyId) || activeJourney).lessons.map((lesson: any) => (
                    <option key={lesson.num} value={lesson.num} className="bg-zinc-900">
                      Aula {lesson.num} - {lesson.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Mensagem do curso</label>
                <textarea
                  value={courseMessage}
                  onChange={(e) => setCourseMessage(e.target.value)}
                  rows={6}
                  placeholder="Escreva a mensagem que sera enviada junto com o link..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
                />
                <p className="mt-2 text-xs text-zinc-500">
                  Use [NOME], [CURSO], [AULA] e [LINK]. O sistema troca esses campos antes de enviar.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Imagem do curso</label>
                {courseImageUrl && (
                  <div className="mb-3 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                    <img
                      src={courseImageUrl}
                      alt="Preview do curso"
                      className="h-40 w-full object-cover"
                    />
                  </div>
                )}
                <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                  <input
                    type="url"
                    value={courseImageUrl.startsWith("data:") ? "" : courseImageUrl}
                    onChange={(e) => setCourseImageUrl(e.target.value)}
                    placeholder="Cole uma URL da imagem, se preferir"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                  />
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2.5 text-sm font-bold text-blue-200 transition hover:bg-blue-500/20">
                    Escolher foto
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleCourseImageFileChange}
                      className="sr-only"
                    />
                  </label>
                </div>
                {courseImageUrl && (
                  <button
                    type="button"
                    onClick={() => setCourseImageUrl("")}
                    className="mt-2 text-xs font-semibold text-rose-300 hover:text-rose-200"
                  >
                    Remover imagem
                  </button>
                )}
                <p className="mt-2 text-xs text-zinc-500">
                  Foto escolhida no computador aparece na pagina do curso. Para a imagem chegar como anexo no WhatsApp, use uma URL publica da imagem e o Disparo Automatico/API.
                </p>
              </div>
              {lastCourseLink && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-100">
                  Link criado: {lastCourseLink}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={closeCourseModal}
                  className="px-5 py-2.5 bg-white/5 border border-white/5 text-zinc-400 hover:text-zinc-200 rounded-xl text-sm font-semibold transition-all"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={courseSending}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-xl text-sm font-semibold shadow-lg active:scale-95 transition-all"
                >
                  {courseSending ? "Salvando..." : editingEnrollmentId ? "Salvar Alteracoes" : "Salvar curso"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cadastrar Nova Dupla Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Heart className="text-rose-400 animate-pulse" size={20} />
                <span>{editingId ? "Editar Dupla de Discipulado" : "Vincular Nova Dupla de Discipulado"}</span>
              </h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }} 
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddPair} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Mentor (Consolidador / Discipulador)</label>
                <input
                  type="text"
                  required
                  value={newMentor}
                  onChange={(e) => setNewMentor(e.target.value)}
                  placeholder="Ex: Sandra Regina"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Discípulo (Novo Convertido / Consolidando)</label>
                <input
                  type="text"
                  required
                  value={newDisciple}
                  onChange={(e) => setNewDisciple(e.target.value)}
                  placeholder="Ex: Clarice de Lima"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Jornada de Estudos</label>
                <select
                  value={newJourneyId}
                  onChange={(e) => {
                    setNewJourneyId(e.target.value);
                    setNewLessons(0);
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  {journeys.map(j => (
                    <option key={j.id} value={j.id} className="bg-zinc-900">{j.name} ({j.lessons.length} Lições)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                    Lições Concluídas (De 0 a {((journeys.find(j => j.id === newJourneyId) || journeys[0]).lessons.length)})
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={(journeys.find(j => j.id === newJourneyId) || journeys[0]).lessons.length}
                    required
                    value={newLessons}
                    onChange={(e) => setNewLessons(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Status Inicial</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as DiscipleshipPair["status"])}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="Em Progresso" className="bg-zinc-900">Em Progresso</option>
                    <option value="Concluído" className="bg-zinc-900">Concluído</option>
                    <option value="Pausado" className="bg-zinc-900">Pausado</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-5 py-2.5 bg-white/5 border border-white/5 text-zinc-400 hover:text-zinc-200 rounded-xl text-sm font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-purple-500/20 active:scale-95 transition-all"
                >
                  {editingId ? "Salvar Alterações" : "Confirmar Vínculo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ===== BIBLIOTECA DE LIÇÕES ===== */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Bookmark className="text-purple-400" size={20} />
          <h3 className="text-xl font-extrabold text-white">Biblioteca de Lições Pastorais</h3>
        </div>
        <p className="text-sm text-zinc-400">Conteúdo completo das lições e estudos pastorais cadastrados. Clique em qualquer lição para expandir.</p>

        <div className="rounded-2xl border border-amber-900/40 bg-zinc-950/80 p-4 shadow-inner shadow-black/40">
          <div className="mb-3 h-2 rounded-full bg-gradient-to-r from-amber-950 via-amber-700 to-amber-950" />
          <div className="grid grid-cols-3 items-end gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
            {lessons.map((lesson, index) => {
              const isSelected = expandedLesson === lesson.num;
              const palette = libraryBookPalette[index % libraryBookPalette.length];

              return (
                <button
                  key={lesson.num}
                  type="button"
                  onClick={() => setExpandedLesson(isSelected ? null : lesson.num)}
                  className={`group relative flex min-h-[128px] flex-col justify-between overflow-hidden rounded-t-sm rounded-b-lg border bg-gradient-to-b ${palette} px-2 py-3 text-left shadow-lg shadow-black/30 transition-all hover:-translate-y-1 hover:brightness-110 ${
                    isSelected ? "ring-2 ring-amber-300/70 ring-offset-2 ring-offset-zinc-950" : ""
                  }`}
                  style={{ height: `${136 + (index % 4) * 14}px` }}
                  title={`${lesson.title} - ${lesson.subtitle}`}
                >
                  <span className="absolute inset-y-0 left-2 w-px bg-white/25" />
                  <span className="absolute inset-y-0 right-2 w-px bg-black/30" />
                  <span className="relative text-[10px] font-black uppercase tracking-wider text-amber-100/90">
                    Licao {lesson.num}
                  </span>
                  <span
                    className="relative mx-auto max-h-[82px] max-w-full overflow-hidden text-center text-[11px] font-extrabold leading-tight text-white"
                    style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                  >
                    {lesson.title}
                  </span>
                  <span className="relative truncate border-t border-white/20 pt-2 text-[10px] font-bold text-white/70">
                    {lesson.base}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-3 h-3 rounded-b-xl border-t border-amber-700/50 bg-gradient-to-r from-stone-950 via-amber-950 to-stone-950 shadow-lg shadow-black/50" />
        </div>

        {selectedLibraryLesson && (
          <div className={`glass-card border ${selectedLibraryLesson.border} overflow-hidden transition-all`}>
            <button
              onClick={() => setExpandedLesson(null)}
              className={`w-full flex items-center justify-between gap-4 p-5 text-left bg-gradient-to-r ${selectedLibraryLesson.color} hover:brightness-110 transition-all`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{selectedLibraryLesson.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Licao 0{selectedLibraryLesson.num}</span>
                  </div>
                  <h4 className="text-base font-extrabold text-white">{selectedLibraryLesson.title} <span className="text-zinc-400 font-medium text-sm">- {selectedLibraryLesson.subtitle}</span></h4>
                  <p className="text-xs text-zinc-400 mt-0.5 italic">{selectedLibraryLesson.baseText} ({selectedLibraryLesson.base})</p>
                </div>
              </div>
              <ChevronUp size={20} className="text-zinc-400 shrink-0" />
            </button>

            <div className="p-6 space-y-6 border-t border-white/10">
              <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Objetivo da Licao</p>
                <p className="text-sm text-zinc-200 font-medium">{selectedLibraryLesson.objective}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedLibraryLesson.sections.map((section: any, si: number) => (
                  <div key={si} className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-2">
                    <h5 className="text-xs font-extrabold text-purple-400 uppercase tracking-wider">{section.title}</h5>
                    {section.body && <p className="text-xs text-zinc-300 leading-relaxed">{section.body}</p>}
                    {section.items.length > 0 && (
                      <ul className="space-y-1">
                        {section.items.map((item: string, ii: number) => (
                          <li key={ii} className="text-xs text-zinc-300 flex items-start gap-2">
                            <span className="text-purple-400 mt-0.5 shrink-0">-</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-purple-600/10 to-indigo-600/5 border border-purple-500/20 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Star size={14} className="text-purple-400" />
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Versiculo para Memorizar</span>
                </div>
                <p className="text-sm text-zinc-200 leading-relaxed italic">{selectedLibraryLesson.memory}</p>
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2">Aplicacao Pratica</p>
                <ul className="space-y-1.5">
                  {selectedLibraryLesson.application.map((item: string, ai: number) => (
                    <li key={ai} className="text-xs text-zinc-300 flex items-start gap-2">
                      <CheckCircle size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="hidden">
        {lessons.map((lesson) => (
          <div key={lesson.num} className={`glass-card border ${lesson.border} overflow-hidden transition-all`}>
            {/* Header */}
            <button
              onClick={() => setExpandedLesson(expandedLesson === lesson.num ? null : lesson.num)}
              className={`w-full flex items-center justify-between gap-4 p-5 text-left bg-gradient-to-r ${lesson.color} hover:brightness-110 transition-all`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{lesson.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Lição 0{lesson.num}</span>
                  </div>
                  <h4 className="text-base font-extrabold text-white">{lesson.title} <span className="text-zinc-400 font-medium text-sm">— {lesson.subtitle}</span></h4>
                  <p className="text-xs text-zinc-400 mt-0.5 italic">{lesson.baseText} ({lesson.base})</p>
                </div>
              </div>
              {expandedLesson === lesson.num
                ? <ChevronUp size={20} className="text-zinc-400 shrink-0" />
                : <ChevronDown size={20} className="text-zinc-400 shrink-0" />}
            </button>

            {/* Expanded content */}
            {expandedLesson === lesson.num && (
              <div className="p-6 space-y-6 border-t border-white/10">
                {/* Objetivo */}
                <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Objetivo da Lição</p>
                  <p className="text-sm text-zinc-200 font-medium">{lesson.objective}</p>
                </div>

                {/* Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lesson.sections.map((section: any, si: number) => (
                    <div key={si} className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-2">
                      <h5 className="text-xs font-extrabold text-purple-400 uppercase tracking-wider">{section.title}</h5>
                      {section.body && <p className="text-xs text-zinc-300 leading-relaxed">{section.body}</p>}
                      {section.items.length > 0 && (
                        <ul className="space-y-1">
                          {section.items.map((item: string, ii: number) => (
                            <li key={ii} className="text-xs text-zinc-300 flex items-start gap-2">
                              <span className="text-purple-400 mt-0.5 shrink-0">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>

                {/* Verso para memorizar */}
                <div className="bg-gradient-to-r from-purple-600/10 to-indigo-600/5 border border-purple-500/20 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={14} className="text-purple-400" />
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Versículo para Memorizar</span>
                  </div>
                  <p className="text-sm text-zinc-200 leading-relaxed italic">{lesson.memory}</p>
                </div>

                {/* Aplicação */}
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2">Aplicação Prática</p>
                  <ul className="space-y-1.5">
                    {lesson.application.map((item: string, ai: number) => (
                      <li key={ai} className="text-xs text-zinc-300 flex items-start gap-2">
                        <CheckCircle size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
        </div>
      </div>

      {/* Lesson Modal (from banner tile click) */}
      {lessonModal !== null && (() => {
        const lesson = lessons.find(l => l.num === lessonModal)!;
        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className={`px-6 py-5 flex items-center justify-between bg-gradient-to-r ${lesson.color} border-b border-white/10 sticky top-0 z-10`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{lesson.icon}</span>
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Lição 0{lesson.num} — {lesson.base}</p>
                    <h3 className="text-lg font-extrabold text-white">{lesson.title}: {lesson.subtitle}</h3>
                  </div>
                </div>
                <button onClick={() => setLessonModal(null)} className="text-zinc-400 hover:text-white p-1">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Objetivo</p>
                  <p className="text-sm text-zinc-200">{lesson.objective}</p>
                </div>
                <div className="bg-purple-600/10 border border-purple-500/20 rounded-xl p-4">
                  <p className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-1">Texto Base</p>
                  <p className="text-sm text-zinc-200 italic">{lesson.baseText}</p>
                  <p className="text-xs text-zinc-500 mt-1">{lesson.base}</p>
                </div>
                {lesson.sections.map((section: any, si: number) => (
                  <div key={si}>
                    <h5 className="text-sm font-extrabold text-purple-400 mb-2">{section.title}</h5>
                    {section.body && <p className="text-sm text-zinc-300 leading-relaxed mb-2">{section.body}</p>}
                    {section.items.length > 0 && (
                      <ul className="space-y-1.5">
                        {section.items.map((item: string, ii: number) => (
                          <li key={ii} className="text-sm text-zinc-300 flex items-start gap-2">
                            <span className="text-purple-400 mt-1">•</span><span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
                <div className="bg-gradient-to-r from-purple-600/10 to-indigo-600/5 border border-purple-500/20 rounded-xl p-5">
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-2">Versículo para Memorizar</p>
                  <p className="text-sm text-zinc-200 italic leading-relaxed">{lesson.memory}</p>
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2">Aplicação Prática</p>
                  {lesson.application.map((item: string, ai: number) => (
                    <div key={ai} className="flex items-start gap-2 mb-1.5">
                      <CheckCircle size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-zinc-300">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Quiz / Certificate Modal */}
      {activeQuiz && (
        <DiscipleshipQuiz
          discipleName={activeQuiz.disciple}
          mentorName={activeQuiz.mentor}
          journeyId={activeQuiz.journeyId || "integracao"}
          onClose={() => setActiveQuiz(null)}
        />
      )}

      {/* ===== CADASTRAR NOVO ESTUDO MODAL ===== */}
      {isNewStudyModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between sticky top-0 bg-zinc-950 z-10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="text-purple-400" size={20} />
                <span>Cadastrar Novo Estudo Pastoral</span>
              </h3>
              <button
                onClick={() => setIsNewStudyModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddStudy} className="p-6 space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Ícone</label>
                  <input
                    type="text"
                    required
                    value={studyIcon}
                    onChange={(e) => setStudyIcon(e.target.value)}
                    placeholder="📖"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-center text-zinc-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Título do Estudo *</label>
                  <input
                    type="text"
                    required
                    value={studyTitle}
                    onChange={(e) => setStudyTitle(e.target.value)}
                    placeholder="Ex: Vida Abundante"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Subtítulo</label>
                <input
                  type="text"
                  value={studySubtitle}
                  onChange={(e) => setStudySubtitle(e.target.value)}
                  placeholder="Ex: Entendendo a provisão em Deus"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Base Bíblica (Ref)</label>
                  <input
                    type="text"
                    value={studyBase}
                    onChange={(e) => setStudyBase(e.target.value)}
                    placeholder="Ex: João 10:10"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Objetivo</label>
                  <input
                    type="text"
                    value={studyObjective}
                    onChange={(e) => setStudyObjective(e.target.value)}
                    placeholder="Ex: Ensinar sobre integridade..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Texto da Base Bíblica</label>
                <textarea
                  value={studyBaseText}
                  onChange={(e) => setStudyBaseText(e.target.value)}
                  placeholder="Ex: 'Eu vim para que tenham vida, e a tenham com abundância.'"
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Versículo para Memorizar</label>
                <input
                  type="text"
                  value={studyMemory}
                  onChange={(e) => setStudyMemory(e.target.value)}
                  placeholder="Ex: Salmo 23:1 — O Senhor é o meu pastor..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Aplicações Práticas (Até 3 pontos)</label>
                <input
                  type="text"
                  value={studyApp1}
                  onChange={(e) => setStudyApp1(e.target.value)}
                  placeholder="Ponto 1: Ore entregando suas ansiedades diariamente."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
                />
                <input
                  type="text"
                  value={studyApp2}
                  onChange={(e) => setStudyApp2(e.target.value)}
                  placeholder="Ponto 2: Leia a bíblia focado na provisão."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
                />
                <input
                  type="text"
                  value={studyApp3}
                  onChange={(e) => setStudyApp3(e.target.value)}
                  placeholder="Ponto 3: Compartilhe o pão com quem necessita."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsNewStudyModalOpen(false)}
                  className="px-5 py-2.5 bg-white/5 border border-white/5 text-zinc-400 hover:text-zinc-200 rounded-xl text-sm font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-purple-500/20 active:scale-95 transition-all"
                >
                  Cadastrar Estudo 📖
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
