
const URL = 'http://localhost:3000';
let ERRO_VAZIO = document.getElementById('erro-vazio');
const CLASSES_LI = ['w-100', 'h-100', 'border' ,'rounded' ,'border-dark', 'd-flex' ,'justify-content-between' ,'align-items-center', 'p-2' ,'text-center']
let usuarioLogado;
let tipoColab;
let idLi;
let dadosUsuarioLogado = 0; 


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

  let possuiLetraMaiuscula = letras.some( l => l.toUpperCase() === l ); 
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
    
        // tela de cadastro de vagas
    let cadastrar = document.getElementById('cadastro-vaga')
    let buttons = document.getElementById('buttons');

        //tela de detalhamento da vaga
    let btnExcluirVaga = document.getElementById('btn-excluir-vaga')
    let btnCandidatarVaga = document.getElementById('btn-candidatar-vaga')
    let btnCancelarVaga = document.getElementById('btn-cancelar-vaga')
    let btnVoltarVaga = document.getElementById('btn-voltar-vaga') //sempre vai existir

    if(tipoColab.tipo==='colaborador') {
      console.log('entrei no if do validar login!!')
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
    }

}).catch((error) => {
    let erro = 'Usuário não encontrado';
    alert(erro, error);
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
  listarVagas()
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
  reprovado; 

  constructor(idVaga,idCandidato,reprovado) {
    this.idVaga = idVaga
    this.idCandidato = idCandidato
    this.reprovado = reprovado
  }
}

class Vaga {
  id; 
  titulo;
  descrição;
  remuneracao; 
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

    let naoHaVagas = document.getElementById('nao-ha-vagas')
    console.log('response.data: ', response.data.length);
    if (response.data.length === 0) {
      console.log('entrei no if do nao ha vagas')
      naoHaVagas.classList.remove('d-none')
      naoHaVagas.classList.add('d-flex')
    } else {
      console.log('entrei no else do nao ha vagas')
      naoHaVagas.classList.remove('d-flex')
      naoHaVagas.classList.add('d-none')
    }

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
      spanTitulo.textContent = e.titulo
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
                } 
              }
            )
          } 
          buscadorUsuario()
        } else {
          let btnCandidatarVaga = document.getElementById('btn-candidatar-vaga')
          btnCandidatarVaga.classList.remove('d-flex')
          btnCandidatarVaga.classList.add('d-none');
        }
        
        
      }) 
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
    console.log('Vagas detalhadas', response);
    response.data.forEach(element => {
      let idDiv = element.id;
      if(idLi == idDiv) {
        let pTitulo = document.createElement('p')
        let pDescricao = document.createElement('p')
        let pRemuneracao = document.createElement('p')
        let spanTitulo = document.createElement('span')
        let spanDescricao = document.createElement('span')
        let spanRemuneracao = document.createElement('span')
        divInformacao.classList.add('border' ,'rounded' ,'border-dark');
        divInformacao.append(pTitulo,pDescricao,pRemuneracao);
        
        pTitulo.setAttribute('class', 'class-list')
        pTitulo.textContent = `Titulo: `

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

    let naoHacandidatos = document.getElementById('nao-ha-cadastros-detalhe')
    let haCandidatos = document.getElementById('ha-cadastros-detalhe')
   
    let colaboradoresNaVaga = response.data.filter(e => e.candidaturas.includes(idLi))
    if(colaboradoresNaVaga.length === 0){
      console.log('entrei na 1 condição', colaboradoresNaVaga, 'lenght', response.data.length );
      naoHacandidatos.classList.remove('d-none')
      naoHacandidatos.classList.add('d-flex')
      haCandidatos.classList.remove('d-flex')
      haCandidatos.classList.add('d-none')
    } else {
      console.log('entrei na 2 condição', colaboradoresNaVaga, 'lenght', response.data.length );
      naoHacandidatos.classList.remove('d-flex')
      naoHacandidatos.classList.add('d-none')
      haCandidatos.classList.remove('d-none')
      haCandidatos.classList.add('d-flex')
    }

    idLi = event.target.id;
    response.data.forEach(element => {
      if(element.candidaturas.includes(idLi) && tipoColab.tipo === 'colaborador') {      
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

    })
  })
  axios.get(`${URL}/candidaturas`)
  .then(response => {
    let vagaColab = response.data.find(e => e.idCandidato == usuarioLogado && e.reprovado === false && e.idVaga == idLi)
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
      console.log('Vaga candidatada!! :)', response);
    
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
      candidaturaAtualizada = new Usuario(response.data.tipo,response.data.nome,response.data.dataNascimento,response.data.email,response.data.senha,candidaturas)
      axios.put(`${URL}/usuarios/${usuarioLogado}`,candidaturaAtualizada)
      .then(response => {
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

  const atualizaVagasCandidatos = async () => {
    const response = await axios.get(`${URL}/vagas/${idLi}`);
    try {
      let candidatos = response.data.candidatos;
      candidatos.push(usuarioLogado)
      let vaga = new Vaga(response.data.titulo,response.data.descricao,response.data.remuneracao,candidatos)
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
      candidaturaAtualizada = new Usuario(response.data.tipo,response.data.nome,response.data.dataNascimento,response.data.email,response.data.senha,candidaturas)
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

//lista de candidatos - tela de detalhes

const listaCandidaturas = () => {
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
        let btnRep = document.createElement('button')
        li.append(pNome,pData,btnRep)
        li.classList.add('w-100','d-flex', 'justify-content-between', 'p-2', 'text-center', 'border-bottom', 'border-dark');
        btnRep.setAttribute('id', `btn-reprovar-${element.id}`);
        btnRep.textContent = 'Reprovar'
        pNome.textContent = `${element.nome}`
        pData.textContent = `${element.dataNascimento}`
        pNome.setAttribute('id', `btn-reprovar-${element.id}`);
               
        btnRep.addEventListener('click', (e) => {
          let idColab = e.target.id
          idColab = idColab.replaceAll('btn-reprovar-', '');
          btnRep.classList.remove('btn-danger');
          btnRep.classList.add('btn-secondary');
          btnRep.setAttribute('disabled',true);
          pNome.classList.add('text-danger');
          console.log(idColab);
            axios.get(`${URL}/candidaturas`).then(
              response => {
                let vagaRep = response.data.find(e =>  e.idVaga == idLi && idColab == e.idCandidato);
                const candidaturas = new Candidatura(vagaRep.idVaga,vagaRep.idCandidato,!vagaRep.reprovado)

                axios.put(`${URL}/candidaturas/${vagaRep.id}`, candidaturas)
                .then(response => {

                  console.log('Atualizado com sucesso :)', response);
                })
            }) 
            .catch(error => {
              console.log('Houve um erro ao atualizar', error);
            })
          })
        axios.get(`${URL}/candidaturas`).then 
        (response => {
            let idColab1 = document.getElementById(`btn-reprovar-${element.id}`);
            idColab1 = idColab1.id
            idColab1 = idColab1.replaceAll('btn-reprovar-','')

            console.log('idcolab: ', idColab1)

            let reprovados = response.data.filter(e => e.reprovado === false && e.idVaga ===idLi)
            let iddavaguinha = reprovados.forEach( e => 
              {if (e.idVaga == idLi && e.idCandidato == idColab1) {
                btnRep.setAttribute('disabled',true);
                pNome.classList.add('text-danger');
                  console.log('idVaga: ',e.idVaga)
                  console.log('idLi: ',idLi)
                } })
                console.log('iddavaguinha: ', iddavaguinha);
                
          }).catch(error=> {
            console.log('erro no get em candidaturas ', error)
          })
        
        if(tipoColab.tipo === 'colaborador') {
          btnRep.classList.add('btn', 'btn-danger', 'd-none')
        } else {
          btnRep.classList.remove('d-none')
          btnRep.classList.add('btn', 'btn-danger','d-flex')
          
        }
      })
    })
  
    .catch(error => {
      console.log('Houve um erro!', error);
    })
}



 const excluirVaga = () => {

   console.log(idLi);
   axios.delete(`${URL}/vagas/${idLi}`)
   .then(response => {
     console.log('Deletado com sucesso', response);
     axios.get(`${URL}/usuarios`)
     .then(response => {
       
        let f = response.data.filter(e => e.candidaturas.includes(idLi));
        for (const i of f) {
          let index = i.candidaturas.indexOf(idLi)
          let id = i.id;
          i.candidaturas.splice(index, 1)
          const usuario = new Usuario(i.tipo,i.nome,i.dataNascimento,i.email,i.senha,i.candidaturas)

         axios.put(`${URL}/usuarios/${id}`, usuario)
         .then(response => {
           console.log('Alterado com sucesso', response);
         }) 
         .catch(error => {
           console.log('Deletado com sucesso', error);
         })
         axios.get(`${URL}/candidaturas`)
         .then(response => {
           
           let find = response.data.filter(e => e.idVaga === idLi && e.idCandidato  == id)
           find.forEach(e => {
             axios.delete(`${URL}/candidaturas/${e.id}`)
             .then(response => {
               console.log('Exluido com sucesso', response);
             })
             .catch(error => {
               console.log('Putz :|', error);
             })
           })
             
           })
         .catch(error => {
           console.log('vish', error);
         })
        }

     })
     .catch(error => {
      console.log(error);
     })
     listarVagas();
   })
   .catch(error => {
     console.log('Erro ao deletar a vaga!', error);
   })
 }
  
  
