
const URL = 'http://localhost:3000';
let ERRO_VAZIO = document.getElementById('erro-vazio');
const CLASSES_LI = ['w-100', 'h-100', 'border' ,'rounded' ,'border-dark', 'd-flex' ,'justify-content-between' ,'align-items-center', 'p-2' ,'text-center']
let usuarioLogado;
let tipoColab;
let idLi;
let dadosUsuarioLogado = 0;
let btnRep = document.createElement('button');


//#region validacoes/* Validações do cadastro */ //

const validarNome = (event) => {

  const input = event ? event.target : document.getElementById('nome-input');
  const { value: nome } = input;
  let error = document.getElementById('nome-erro');
  
  let nomesCaracs = nome.split(' ').join('');
  let nomeSeparada = [...nomesCaracs]
  
  const naoPossuiNumero = nomeSeparada.every(c => isNaN(c));

  const naoPossuirCaracEspecial = nomeSeparada.every(c => c.toUpperCase() !== c.toLowerCase())

  const naoPossuiEspaco = nomeSeparada.some(c => c !== ' ')
  
  const eValido = naoPossuiNumero && naoPossuiEspaco && naoPossuirCaracEspecial
  
  if(!eValido) {
    error.classList.remove('d-none');
    error.classList.add('text-danger');
  } else {
    error.classList.add('d-none');
  }
  return eValido;
  
}

const validarEmail = () => {
  let emailDigitado = document.getElementById('email-input-registration').value;
  let listaCaracteres = emailDigitado.split(''); // [...emailDigitado]

  let emailSplit = emailDigitado.split('@');
  
  let possuiArroba = emailSplit.length > 1;

  let dominioEmail = possuiArroba ? emailSplit[1] : '';
  let dominioEmailSplit = dominioEmail.split('.');

  let possuiPontosNoDominio = dominioEmailSplit.length > 1;

  let possuiCaracteresEntrePontos = dominioEmailSplit.every( d => d.length > 1 );

  let comecaComLetra = listaCaracteres.length ? listaCaracteres[0].toUpperCase() !== listaCaracteres[0].toLowerCase() : false;

  let ehValido = possuiArroba && possuiPontosNoDominio && possuiCaracteresEntrePontos && comecaComLetra;

  // para setar o texto de erro em vermelho
  let erroEmail = document.getElementById('email-registration-error');
  erroEmail.setAttribute('class', ehValido ? 'd-none' : 'text-danger');

  return ehValido;
}

const validarSenha = () => {
  let senhaDigitada = document.getElementById('password-input-registration').value;
  let listaCaracteres = senhaDigitada.split('');

  let letras = listaCaracteres.filter( char => char.toLowerCase() !== char.toUpperCase() );

  let possuiLetraMaiuscula = letras.some( l => l.toUpperCase() === l ); // "A".toUppercase() === "A"
  let possuiLetraMinuscula = letras.some( l => l.toLowerCase() === l );

  let possuiCharEspecial = listaCaracteres.some( char => char.toLowerCase() === char.toUpperCase() && isNaN(parseInt(char)) );
  let possuiNumero = listaCaracteres.some( char => char.toLowerCase() === char.toUpperCase() && !isNaN(parseInt(char)));

  let possuiOitoCaracteres = senhaDigitada.length >= 8;

  let naoPossuiEspacos = !senhaDigitada.includes(' ');

  let ehValido = possuiOitoCaracteres && possuiLetraMaiuscula && possuiLetraMinuscula && 
      possuiCharEspecial && possuiNumero && naoPossuiEspacos;

  // para setar o texto de erro em vermelho
  let erroSenha = document.getElementById('password-registration-error');
  erroSenha.setAttribute('class', ehValido ? 'd-none' : 'text-danger');

  return ehValido;
}

const validarData = () => { 
  let inputData = document.getElementById('date-input-registration');
  let dataDigitada = inputData.value;

  adicionarMascaraData(inputData, dataDigitada);

  let dataConvertida = moment(dataDigitada, 'DDMMYYYY');

  let dezoitoAnosAtras = moment().diff(dataConvertida, 'years') >= 18;

  // comparações de data - date1.isBefore(date2)  /  date1.isAfter(date2)  /  date1.isSameOrBefore(date2)  /  date1.isSameOrAfter(date2)
  let dataAnteriorHoje = dataConvertida.isBefore(moment());

  let ehValido = dataConvertida.isValid() && dataAnteriorHoje && dezoitoAnosAtras && dataDigitada.length === 10; // 10/05/2001

  // para setar o texto de erro em vermelho
  let erroData = document.getElementById('date-registration-error');
  erroData.setAttribute('class', ehValido ? 'd-none' : 'text-danger');

  return ehValido;
}

const adicionarMascaraData = (input, data) => {
  let listaCaracteres = [...data];
  
  let listaFiltrada = listaCaracteres.filter(c => !isNaN(parseInt(c)));
  if(listaFiltrada && listaFiltrada.length) {
      let dataDigitada = listaFiltrada.join('');

      const { length } = dataDigitada;

      switch(length) { 
          case 0: case 1: case 2:
              input.value = dataDigitada; 
              break;
          case 3: case 4:
              input.value = `${dataDigitada.substring(0, 2)}/${dataDigitada.substring(2, 4)}`;
              break;
          default:
              input.value = `${dataDigitada.substring(0, 2)}/${dataDigitada.substring(2, 4)}/${dataDigitada.substring(4, 8)}`;
      }
  }
}


//#endregion validacoes

const validarCadastro = (event) => {
  event.preventDefault();
  let cadastroValido = validarData() && validarEmail() && validarSenha() && validarNome();


  console.log(`Cadastro ${cadastroValido ? 'válido!' : 'inválido'}`);

  if(cadastroValido) {
    cadastrarUsuario(event);
  } else {
    document.getElementById('nome-input').value = '';
    document.getElementById('email-input-registration').value = '';
    document.getElementById('date-input-registration').value = '';
    document.getElementById('password-input-registration').value = '';
  }
}

const validarLogin = () => {
  const emailDigitado = document.getElementById('email-input-login').value;
  const senhaDigitada = document.getElementById('password-input-login').value;

  
  axios.get(`${URL}/usuarios?=email${emailDigitado}`)
  .then( (sucesso) => {
    let colabs = sucesso.data[0];
    let validatePass = colabs.senha === senhaDigitada;
    const loginOk = sucesso.data.find(e => e.email === emailDigitado);
    const isColab = sucesso.data.find(e => e.tipo === 'colaborador' && e.email === emailDigitado);
    tipoColab = sucesso.data.find(e => e.email === emailDigitado);
    usuarioLogado = loginOk.id;

    if(validatePass && loginOk) {
      irPara('login', 'home');
    } else if(!loginOk) {
      alert('Email incorreto!')
    } else {
      alert('Senha incorreta!')
    }

        // id="btn-voltar-vaga"  VOLTAR (COLAB E RECRUTADOR)
        // id="btn-excluir-vaga" EXCLUIR (RECRUTADOR)
        // id="btn-candidatar-vaga" CANDIDATAR (COLABORADOR)
        // id="btn-cancelar-vaga" CANCELAR (COLABORADOR)
    
        // tela de cadastro de vagas
    let cadastrar = document.getElementById('cadastro-vaga')
    let buttons = document.getElementById('buttons');

        //tela de detalhamento da vaga
    let btnExcluirVaga = document.getElementById('btn-excluir-vaga')
    let btnCandidatarVaga = document.getElementById('btn-candidatar-vaga')
    let btnCancelarVaga = document.getElementById('btn-cancelar-vaga')
    let btnVoltarVaga = document.getElementById('btn-voltar-vaga') //sempre vai existir

    if(tipoColab.tipo==='colaborador') {
      //variavel para popular as candidaturas conforme id do usuário logado
      console.log('entrei no if do validar login!!')
      // tela de cadastro de vagas
      cadastrar.classList.remove('d-flex')
      cadastrar.classList.add('d-none')
      buttons.classList.remove('justify-content-between')
      buttons.classList.add('justify-content-center')

      btnCandidatarVaga.classList.remove('d-none')
      btnCandidatarVaga.classList.add('d-flex','btn','btn-dark')
      
      btnExcluirVaga.classList.remove('d-flex')
      btnExcluirVaga.classList.add('d-none')

      
    }  else {
      cadastrar.classList.remove('d-none')
      cadastrar.classList.add('d-flex')
      cadastrar.classList.add('btn', 'btn-dark')
      buttons.classList.remove('justify-content-center')
      buttons.classList.add('justify-content-between')

      btnCandidatarVaga.classList.remove('d-flex')
      btnCandidatarVaga.classList.add('d-none')      
      btnExcluirVaga.classList.remove('d-none')
      btnExcluirVaga.classList.add('d-flex')
      btnExcluirVaga.classList.add('btn','btn-dark')
      // btnRep.classList.add('d-flex')
    }

}).catch((error) => {
    let erro = 'Usuário não encontrado';
    console.log(erro, error);
})
listarVagas()

}

validarRemuneracao = () => {
  const inputNumero = document.getElementById('payment-input-registration');
  let { value: descricao } = inputNumero
  let ehValido;
  descricao = descricao.replaceAll('R$','')
  let numeros = [...descricao];
  if(descricao) {
    let possuiNumero = numeros.every( char => char.toLowerCase() === char.toUpperCase() && !isNaN(parseInt(char)));
    ehValido = possuiNumero;
    ERRO_VAZIO.setAttribute('class', ehValido ? 'd-none' : 'text-danger');
    
  } else {
    ERRO_VAZIO.setAttribute('class', ehValido ? 'text-danger' : 'd-none');
  }
  console.log(ehValido);
  return ehValido;

}

adicionarMascaraRemuneratoria = () => {
  let input = document.getElementById('payment-input-registration')
  let valor = document.getElementById('payment-input-registration').value
  
    let listaCaracteres = [...valor];
    let listaFiltrada = listaCaracteres.filter(c => !isNaN(parseInt(c)));
    if(listaFiltrada && listaFiltrada.length) {
        let dataDigitada = listaFiltrada.join('');
  
        const { length } = dataDigitada;
        console.log(dataDigitada)
  
        switch(length) { 
            default:
              input.value = `R$${dataDigitada}`;              
            break;
        }
        
        
    }
}

validarCadastroDeVagas = (event) => {
  event.preventDefault()
  const inputTitulo = document.getElementById('titulo-input').value;
  const inputDescription = document.getElementById('description-input-registration').value;

  let cadastroValido = inputTitulo && inputDescription && validarRemuneracao();

  if(cadastroValido) {
    cadastrarVaga(event);
    document.getElementById('titulo-input').value = '';
    document.getElementById('description-input-registration').value = '';
    document.getElementById('payment-input-registration').value = '';
  } else {
    ERRO_VAZIO.setAttribute('class', cadastroValido ? 'd-none' : 'text-danger');
  } 

  return cadastroValido;
}

/*Funções util */

const alternarClasses = (elemento, ...classes) => {
  classes.forEach( classe => {
    elemento.classList.toggle(classe);
  });
}

const irPara = (origem, destino) => {
  const elementoOrigem = document.getElementById(origem);
  const elementoDestino = document.getElementById(destino);
  
  alternarClasses(elementoOrigem, 'd-none', 'd-flex');
  alternarClasses(elementoDestino, 'd-none', 'd-flex');
}


/* Classes de cadastro */

class Usuario {
  id; 
  tipo;
  nome;
  dataNascimento;
  email;
  senha;
  candidaturas = []; // lista de Candidatura

  constructor(tipo,nome,dataNascimento,email,senha,candidaturas) {
    this.tipo = tipo;
    this.nome = nome;
    this.dataNascimento = dataNascimento;
    this.email = email;
    this.senha = senha;
    this.candidaturas = candidaturas

  }
}

class Candidatura {
  idVaga;
  idCandidato;
  reprovado; // true or false

  constructor(idVaga,idCandidato,reprovado) {
    this.idVaga = idVaga
    this.idCandidato = idCandidato
    this.reprovado = reprovado
  }
}

class Vaga {
  id; // (automático json-server)
  titulo;
  descrição;
  remuneracao; // (salvar no formato: R$ 3.200,50)
  candidatos = []; 

  constructor(titulo,descricao,remuneracao,candidatos) {
    this.titulo = titulo
    this.descricao = descricao
    this.remuneracao = remuneracao
    this.candidatos = candidatos
  }
}  

/* Requisições axios */

const cadastrarUsuario =  (event) => {
  event.preventDefault();

  const inputSelect = document.getElementById('tipo-usuario');
  const { value: option } = inputSelect;
  
  console.log(option);
  

  const inputNome = document.getElementById('nome-input');
  const { value: nome } = inputNome;
  
  const inputData = document.getElementById('date-input-registration');
  const { value: nasc } = inputData;
  
  const inputEmail = document.getElementById('email-input-registration');
  const { value: email } = inputEmail;
  
  const inputSenha = document.getElementById('password-input-registration');
  const { value: senha } = inputSenha;

  const nomeCapital = nome.split(' ').map( nome => nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase() ).join(' ');

  const usuarios = new Usuario(option,nomeCapital,nasc,email,senha,[])


  axios.post(`${URL}/usuarios`, usuarios)
  .then(success => {
    console.log('Usuário', success);
  })
  .catch(error => {
    console.log("Erro ao cadastrar usuário!!", error);
  })

}

const cadastrarVaga =  (event) => {

  event.preventDefault();

  const inputTitulo = document.getElementById('titulo-input');
  const { value: titulo } = inputTitulo;
  
  const inputDescricao = document.getElementById('description-input-registration');
  const { value: descricao } = inputDescricao;
  
  const inputRemuneracao = document.getElementById('payment-input-registration');
  let { value: remuneracao } = inputRemuneracao;
  let valorConvertido = remuneracao.replaceAll('R$','')
  valorConvertido = parseInt(valorConvertido)
  valorConvertido = valorConvertido.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})
  
  const tituloCapital = titulo.split(' ').map( titulo => titulo.charAt(0).toUpperCase() + titulo.slice(1).toLowerCase() ).join(' ');

  const vaga = new Vaga(tituloCapital, descricao, valorConvertido,[])

  axios.post(`${URL}/vagas`, vaga)
  .then(success => {
    console.log('Vaga Incluída', success);
  })
  .catch(error => {
    console.log("Erro ao cadastrar Vaga!!", error);
  })
  listarVagas()
}

const forgetPassword = (event) => {
  event.preventDefault();
  
  axios.get(`${URL}/usuarios`)
  .then(response => {

    const emailDigitado = prompt('Digite o email: ');
    let emailData = response.data

    let find = emailData.find(e => e.email === emailDigitado);
    alert(find.senha)

  })
  .catch(error => {
    alert("Email não encontrado!!", error);
  })
}

const listarVagas = () => {
  let ulVaga = document.getElementById('vagas-list')
  ulVaga.textContent=''
  axios.get(`${URL}/vagas`).then(response => {
    response.data.forEach(e => {
      let liVaga = document.createElement('li')
      liVaga.setAttribute('id',e.id)
      liVaga.classList.add('w-100', 'h-10', 'border' ,'rounded' ,'border-dark', 'd-flex' ,'justify-content-between' ,'align-items-center', 'p-2' ,'text-center','mb-2','teste')
      let pTitulo = document.createElement('p')
      let spanTitulo = document.createElement('span')
      let spanRemunera = document.createElement('span')
      let pSalario = document.createElement('p')
      ulVaga.appendChild(liVaga)
      liVaga.append(pTitulo,pSalario)
      pTitulo.textContent=`Título: `
      pTitulo.append(spanTitulo)
      spanTitulo.textContent=e.titulo
      pTitulo.setAttribute('class','class-list')
      spanTitulo.setAttribute('class','span')
      pSalario.textContent = `Remuneração: `
      pSalario.append(spanRemunera)
      spanRemunera.textContent=e.remuneracao
      spanRemunera.setAttribute('class','span')
      pSalario.setAttribute('class','class-list')

      liVaga.addEventListener('click', (e) => {
        e.preventDefault()
        let home = document.getElementById('home')
        let descricaoVaga = document.getElementById('descricao-vaga')
        home.classList.remove('d-flex')
        home.classList.add('d-none')
        descricaoVaga.classList.remove('d-none')
        descricaoVaga.classList.add('d-flex')
        detalharVaga(event)
        listaCandidaturas();
        if (tipoColab.tipo === 'colaborador') {
          console.log('entrei no if COLABORADOR')
          const buscadorUsuario = () => { 
            axios.get(`${URL}/usuarios/${usuarioLogado}`).then (
              response => {
                let candidaturas = response.data.candidaturas
                if (candidaturas.includes(idLi)) {
                        let btnCandidatarVaga = document.getElementById('btn-candidatar-vaga')
                        let btnCancelarVaga = document.getElementById('btn-cancelar-vaga')
                        btnCandidatarVaga.classList.remove('d-flex')
                        btnCandidatarVaga.classList.add('d-none');
                        btnCancelarVaga.classList.remove('d-none')
                        btnCancelarVaga.classList.add('d-flex')
                        btnCancelarVaga.classList.add('btn','btn-danger')
                } else {
                  console.log('não entrei no if')
                }
              }
            )
          } 
          buscadorUsuario()
        } else {
          console.log('entrei no else RECRUTADOR')
          let btnCandidatarVaga = document.getElementById('btn-candidatar-vaga')
          btnCandidatarVaga.classList.remove('d-flex')
          btnCandidatarVaga.classList.add('d-none');
        }
        
        
      }) //aqui termina
    })
  }
  ).catch(erro => {
    console.log('Erro ao buscar vagas!  ', erro)
  })

}

const detalharVaga = (event) => {
  axios.get(`${URL}/vagas`)
  .then(response => {
    idLi = event.target.id;
    let divInformacao = document.getElementById('informacoes-vaga')
    divInformacao.textContent = ''
    response.data.forEach(element => {
      let idDiv = element.id;
      // console.log(idDiv,idLi);
      if(idLi == idDiv) {
        // console.log(event.target.id);
        let pTitulo = document.createElement('p')
        let pDescricao = document.createElement('p')
        let pRemuneracao = document.createElement('p')
        let spanTitulo = document.createElement('span')
        let spanDescricao = document.createElement('span')
        let spanRemuneracao = document.createElement('span')
        divInformacao.classList.add('border' ,'rounded' ,'border-dark');
        divInformacao.append(pTitulo,pDescricao,pRemuneracao);
        // let btnReprovar = document.createElement('button');
        // btnRep.classList.add('btn', 'btn-danger', 'd-flex');
        
        pTitulo.setAttribute('class', 'class-list')
        pTitulo.textContent = `Titulo: ${idLi}`

        pTitulo.append(spanTitulo);
        spanTitulo.textContent = `${element.titulo}`
        
        pDescricao.setAttribute('class', 'class-list')
        pDescricao.textContent = `Descrição: `
        pDescricao.append(spanDescricao);
        spanDescricao.textContent = `${element.descricao}`
        
        pRemuneracao.setAttribute('class','class-list')
        pRemuneracao.textContent = `Remuneração: `
        pRemuneracao.append(spanRemuneracao);
        spanRemuneracao.textContent = `${element.remuneracao}`
        
        
      }
    })
    
  }).catch(error => {
    console.log('Houve algum erro', error);
  })
  
  axios.get(`${URL}/usuarios`)
  .then(response => {

    let candidaturas = response.data.candidaturas;
    idLi = event.target.id;
    
    let ulCandidato = document.getElementById('lista-candidatos-vagas')
    response.data.forEach(element => {
      // console.log(element.candidaturas);
      if(element.candidaturas.includes(idLi) && tipoColab.tipo==='colaborador') {      
        let btnCancelar = document.getElementById('btn-cancelar-vaga')
        let btnCadastrar = document.getElementById('btn-candidatar-vaga');
        btnCadastrar.classList.remove('d-flex')
        btnCadastrar.classList.add('d-none');
        btnCancelar.classList.remove('d-none')
        btnCancelar.classList.add('d-flex')
        btnCancelar.removeAttribute('disabled', true)
        btnCancelar.removeAttribute('disabled', false)
      } else if (tipoColab.tipo === 'colaborador') {
        let btnCancelar = document.getElementById('btn-cancelar-vaga')
        let btnCadastrar = document.getElementById('btn-candidatar-vaga');
        btnCadastrar.classList.add('d-flex')
        btnCadastrar.classList.remove('d-none');
        btnCancelar.classList.add('d-none')
        btnCancelar.classList.add('btn','btn-danger')
        btnCancelar.classList.remove('d-flex')
      }

      let liCandidato = document.createElement('li')
      liCandidato.classList.add('w-100', 'd-flex', 'justify-content-between', 'p-2', 'text-center', 'border-bottom', 'border-dark')

      let pNomeCand = document.createElement('p')
      let pNascCand = document.createElement('p')

      
      btnRep.classList.add('btn', 'btn-danger', 'd-flex')

      liCandidato.append(pNomeCand,pNascCand, btnRep)
      btnRep.textContent = 'Reprovar'
      pNomeCand.textContent = element.nome
      pNascCand.textContent = element.dataNascimento 
    })
  })
  axios.get(`${URL}/candidaturas`)
  .then(response => {
    let vagaColab = response.data.find(e => e.idCandidato == usuarioLogado && e.reprovado === false && e.idVaga == idLi)
    console.log('Entrei no get', vagaColab);
    if(vagaColab) {
      console.log('ENTRA AQUI PLS');
      let btnCancelar = document.getElementById('btn-cancelar-vaga');
      btnCancelar.setAttribute('disabled', true);
    } 

  })
}

const candidatarVaga = (event) => {
  event.preventDefault();
  const candidatura = new Candidatura(idLi,usuarioLogado,true)
  axios.post(`${URL}/candidaturas`, candidatura)
  .then(response => {
      let btnCancelar = document.getElementById('btn-cancelar-vaga')
      let btnCadastrar = document.getElementById('btn-candidatar-vaga');
      btnCadastrar.classList.remove('d-flex')
      btnCadastrar.classList.add('d-none');
      btnCancelar.classList.remove('d-none')
      btnCancelar.classList.add('d-flex')
      btnCancelar.classList.add('btn','btn-danger')
    
  })
  .catch(error => {
    console.log('Houve um erro ao realizar a candidatura', error);
  })
  
  atualizaCandidatura();
}

const voltarAHome = () => {
  let btnCancelar = document.getElementById('btn-cancelar-vaga')
  let btnCadastrar = document.getElementById('btn-candidatar-vaga');
  btnCadastrar.classList.add('d-flex')
  btnCadastrar.classList.remove('d-none');
  btnCancelar.classList.add('d-none')
  btnCancelar.classList.remove('d-flex')
}

const atualizaCandidatura = () => {
  const buscaUsuario = async () => { 
    const response = await axios.get(`${URL}/usuarios/${usuarioLogado}`)
    try {
      let candidaturaAtualizada;
      let candidaturas = response.data.candidaturas;
      candidaturas.push(idLi)
      console.log(`Informações do usuario`, candidaturas);
      console.log(response.data.id);
      candidaturaAtualizada = new Usuario(response.data.tipo,response.data.nome,response.data.dataNascimento,response.data.email,response.data.senha,candidaturas)
      console.log(`Entrou no ATUALIZADO:`,candidaturaAtualizada);
      axios.put(`${URL}/usuarios/${usuarioLogado}`,candidaturaAtualizada)
      .then(response => {
                // console.log(candidaturaAtualizada);
        // console.log('Candidatura atualizada', response);
      })
      .catch(error => {
        console.log('Ocorreu um erro ao atualizar a candidatura', error);
      })
    }
    catch(error) {
      console.log('Usuário não encontrado', error);
    }
  }

  const atualizaVagasCandidatos = async () => {
    const response = await axios.get(`${URL}/vagas/${idLi}`);
    try {
      let candidatos = response.data.candidatos;
      console.log('Usuário inserido na vaga', candidatos);
      candidatos.push(usuarioLogado)
      let vaga = new Vaga(response.data.titulo,response.data.descricao,response.data.remuneracao,candidatos)
      console.log(`Vaga atualizada`, vaga);
      axios.put(`${URL}/vagas/${idLi}`, vaga)
      .then(response => {
        console.log('Vaga atualizada', response);
      })
      .catch(error => {
        console.log('Ocorreu um erro ao atualizar a vaga', error);
      })
    } catch (error) {
      console.log('Vaga não atualizada', error);
    }
  listaCandidaturas();
  
}
buscaUsuario();
atualizaVagasCandidatos();
}

const cancelarCandidatura = () => {
  const buscaUsuario = async () => { 
    const response = await axios.get(`${URL}/usuarios/${usuarioLogado}`)
    try {
      let candidaturaAtualizada;
      let candidaturas = response.data.candidaturas;
      let index = candidaturas.indexOf(idLi)
      candidaturas.splice(index, 1)
      console.log(`Informações do usuario`, candidaturas);
      // console.log(response.data.id);
      candidaturaAtualizada = new Usuario(response.data.tipo,response.data.nome,response.data.dataNascimento,response.data.email,response.data.senha,candidaturas)
      console.log(`Entrou no ATUALIZADO:`,candidaturaAtualizada);
      axios.put(`${URL}/usuarios/${usuarioLogado}`,candidaturaAtualizada)
      .then(response => {
        let btnCancelar = document.getElementById('btn-cancelar-vaga')
        let btnCadastrar = document.getElementById('btn-candidatar-vaga');
        btnCadastrar.classList.add('d-flex')
        btnCadastrar.classList.remove('d-none');
        btnCancelar.classList.add('d-none')
        btnCancelar.classList.remove('d-flex')
        console.log('Candidatura atualizada', response);
      })
      .catch(error => {
        console.log('Ocorreu um erro ao atualizar a candidatura', error);
      })
      
    }
    catch(error) {
      console.log('Usuário não encontrado', error);
    }
  }

  const removeCandidaturaVagas = async () => {
      const response = await axios.get(`${URL}/vagas/${idLi}`);
      try {
        let candidatos = response.data.candidatos;
        let index = candidatos.indexOf(usuarioLogado)
        candidatos.splice(index, 1)
        let vaga = new Vaga(response.data.titulo,response.data.descricao,response.data.remuneracao,candidatos)
        // console.log(`Vaga atualizada`, vaga);
        axios.put(`${URL}/vagas/${idLi}`, vaga)
        .then(response => {
          console.log('Vaga atualizada', response);
        })
        .catch(error => {
          console.log('Ocorreu um erro ao atualizar a vaga', error);
        })
      } catch (error) {
        console.log('Vaga não atualizada', error);
      }
    }

  const buscaCandidaturaParaExcluir = () => {
    axios.get(`${URL}/candidaturas`).then(
       response => {
      let idExclusao = response.data.find(e => e.idCandidato == usuarioLogado && e.idVaga == idLi)
      console.log(idExclusao);
        const deletaCandidatura = () => {
          axios.delete(`${URL}/candidaturas/${idExclusao.id}`).then (
            response => {
              console.log('Candidatura excluída!', response)
            }
          ).catch(error => {
            console.log('Erro ao excluir candidatura!',error);
          })
        }
        deletaCandidatura()
        listaCandidaturas();

      }    
    ).catch(error => {
      console.log('Erro ao buscar candidatos!', error);
    })
  
  }
  
  buscaUsuario();
  removeCandidaturaVagas();
  buscaCandidaturaParaExcluir();
}


const listaCandidaturas = () => {
  console.log('Entrei na lista de candidaturas');
  let ulPai = document.getElementById('lista-candidatos-vagas');
  ulPai.textContent = ""
  axios.get(`${URL}/usuarios`)
  .then(response => {
    let idCandidaturas = response.data.filter(e => 
      e.candidaturas.includes(idLi)
      )
      idCandidaturas.forEach(element => {
        const li = document.createElement('li');
        const pNome = document.createElement('p');
        const pData = document.createElement('p');
        ulPai.appendChild(li)
        li.append(pNome,pData,btnRep)
        li.classList.add('w-100','d-flex', 'justify-content-between', 'p-2', 'text-center', 'border-bottom', 'border-dark');
        btnRep.setAttribute('id', `btn-reprovar-${element.id}`);
        btnRep.textContent = `Reprovar`
        pNome.textContent = `${element.nome}`
        pData.textContent = `${element.dataNascimento}`
        if(tipoColab.tipo === 'colaborador') {
          btnRep.classList.add('btn', 'btn-danger', 'd-none')
          
        } else {
          btnRep.classList.remove('d-none')
          btnRep.classList.add('btn', 'btn-danger','d-flex')

        }
        // btnRep.addEventListener('onclick', reprovarVaga(event))
      })
    console.log('candidatura',idCandidaturas);
  })
  .catch(error => {
    console.log('Houve um erro!', error);
  })
} 




btnRep.addEventListener('click', (e) => {
    let idColab = e.target.id
    idColab = idColab.replaceAll('btn-reprovar-', '');
    btnRep.classList.remove('btn-danger')
    btnRep.classList.add('btn-secondary')
    console.log(idColab);
    axios.get(`${URL}/candidaturas`).then(
      response => {
        let vagaRep = response.data.find(e => e.idVaga == idLi && idColab == e.idCandidato);
        console.log(vagaRep);
        const candidaturas = new Candidatura(vagaRep.idVaga,vagaRep.idCandidato,!vagaRep.reprovado)
        axios.put(`${URL}/candidaturas/${vagaRep.id}`, candidaturas)
        .then(response => {

          console.log('Atualizado com sucesso :)', response);
        })
      }) 
  })
  