// let input = 'x = 42\ny = 10\nz = x + y';
// let ast = compiler(input);
// console.log(JSON.stringify(ast, null, 2));

function compilar() {
 
    const codigo = document.getElementById("codigo").value;
    let tokens = analisisLexico(codigo);
    let ast = analisisSintactico(tokens);
    let simbolos = analisisSemantico(ast)
    // ast = analyzer(ast);
    mostrarAnalisisLexico(tokens);
    mostrarAnalisisSintactico(ast);
    mostrarAnalisisSemantico(simbolos);
    return ast;
  
    // const tokens = analizarLexico(codigo);
    // const arbolSintaxis = analizarSintaxis(tokens);
    // console.log(arbolSintaxis)
    // const tablaSimbolos = analizarSemantica(arbolSintaxis);
    // const codigoObjeto = generarCodigo(arbolSintaxis, tablaSimbolos);
    // mostrarAnalisisLexico(tokens);
    // mostrarAnalisisSintactico(arbolSintaxis);
    // mostrarAnalisisSemantico(tablaSimbolos);
    // mostrarCodigoObjeto(codigoObjeto);
  }

function analisisLexico(input) {
    const tokens = [];
    const keywords = ['if', 'else', 'while', 'do', 'for', 'int', 'float', 'char', 'bool', 'true', 'false', 'void'];
    let i = 0;
    while (i < input.length) {
      let char = input[i];
      if (char === ' ') {
        i++;
        continue;
      }
      if (char === '+' || char === '-' || char === '*' || char === '/' || char === '=' || char === '>' || char === '<' || char === '&' || char === '|') {
        tokens.push({ type: 'operador', value: char });
        i++;
        continue;
      }
      if (char === '(' || char === ')') {
        tokens.push({ type: 'parentesis', value: char });
        i++;
        continue;
      }
      if (char === '{' || char === '}') {
        tokens.push({ type: 'llave', value: char });
        i++;
        continue;
      }
      if (/\d/.test(char)) {
        let value = '';
        while (/\d/.test(char)) {
          value += char;
          char = input[++i];
        }
        tokens.push({ type: 'number', value });
        continue;
      }
      if (/[a-z]/i.test(char)) {
        let value = '';
        while (/[a-z\d]/i.test(char)) {
          value += char;
          char = input[++i];
        }
        if (keywords.includes(value)) {
          tokens.push({ type: 'keyword', value });
        } else {
          tokens.push({ type: 'identificador', value });
        }
        continue;
      }
      if (char === '/' && input[i + 1] === '/') {
        while (char !== '\n') {
          char = input[++i];
        }
        continue;
      }
      throw new TypeError('Carácter no reconocido: ' + char);
    }
    return tokens;
  }
  
  // Analizador sintáctico (parser)
  function analisisSintactico(tokens) {

    let current = 0;
    function walk() {
      let token = tokens[current];
      if (token.type === 'number') {
        current++;
        return {
          type: 'ExpresionNumerica',
          value: token.value
        };
      }
      if (token.type === 'operador' ) {
        let name = token.value;
        current ++;
        let value = walk();
        return {
          type: 'ExpresionAsignacion',
          name,
          value
        };
      }
      if (token.type === 'identificador') {
        current++;
        return {
          type: 'ExpresionIdentificador',
          name: token.value
        };
      }
      throw new TypeError('Tipo de token inesperado: ' + token.type);
    }
    let ast = {
      type: 'Program',
      body: []
    };
    while (current < tokens.length) {
      ast.body.push(walk());
    }
    return ast;
  }


  //Validar el analisis sintactico no esta asignando los simbolos de asignacion
  function analisisSemantico(ast) {
    debugger
    let variables = {};
    function traverse(node) {
      if (node.type === 'ExpresionAsignacion') {
        if (!variables[node.name]) {
          variables[node.name] = true;
        } else {
          throw new Error('La variable ' + node.name + ' ya ha sido declarada');
        }
        traverse(node.value);
      } else if (node.type === 'ExpresionIdentificador') {
        if (!variables[node.name]) {
          throw new Error('La variable ' + node.name + ' no ha sido declarada');
        }
      } else if (node.type === 'ExpresionNumerica') {
        // No hay nada que hacer
      } else {
        throw new TypeError('Tipo de nodo inesperado: ' + node.type);
      }
    }
    ast.body.forEach(traverse);
    return ast;
  }

  function mostrarAnalisisLexico(tokens) {
    const resultado = tokens
      .map((token) => `[${token.type}: ${token.value}]`)
      .join("\n");
    document.getElementById("lexico").textContent = resultado;
    console.log(tokens);
  }

  function mostrarAnalisisSintactico(arbolSintaxis) {
    const resultado = JSON.stringify(arbolSintaxis, null, 2);
    document.getElementById("sintactico").textContent = resultado;
  }

  function mostrarAnalisisSemantico(tablaSimbolos) {
    const resultado = JSON.stringify(tablaSimbolos, null, 2);
    document.getElementById("semantico").textContent = resultado;
  }
  const darkModeToggle = document.querySelector('#dark-mode-toggle');
const body = document.body;

darkModeToggle.addEventListener('click', () => {
  body.classList.toggle('dark-mode');
})  
  
  // Compilador (compiler)
//   function compiler(input) {
//     let tokens = lexer(input);
//     let ast = parser(tokens);
//     ast = analyzer(ast);
//     return ast;
//   }