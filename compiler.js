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
  
  }

function analisisLexico(input) {
    const tokens = [];
    const keywords = ['if', 'else', 'while', 'do', 'for', 'int', 'float', 'char', 'bool', 'true', 'false', 'void'];
    const declare = ['let', 'const'];
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
        } else if (declare.includes(value)) {
          tokens.push({ type: 'declare', value });
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
      if (char === ';') {
        tokens.push({ type: 'fin', value: char });
        break;
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
      if (token.type === 'fin') {
        current++;
        return {
          type: 'ExpresionFin',
          name: token.value
        };
        
      }
      if (token.type === 'keyword') {
        current++;
        return {
          type: 'ExpresionKeyword',
          name: token.value,
          variables: [token.value]
        };
        
      }
      if (token.type === 'declare') {
        current++;
        return {
          type: 'DeclaracionVariable',
          name: token.value,
          variables: [token.value]
        };
        
      }
      if (token.type === 'llave') {
        current++;
        return {
          type: 'ExpresionObjeto',
          name: token.value
        };
        
      }
      if (token.type === 'parentesis') {
        current++;
        return {
          type: 'ExpresionFuncion',
          name: token.value
        };
        
      }
      if (token.type === 'operador') {
        current++;
        return {
          type: 'ExpresionOperacion',
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
    debugger;
    const variablesDeclaradas = {};
    let variableName;
  
    // Primera pasada: recolectar declaraciones de variables
    ast.body.forEach((node) => {
      if (node.type === "DeclaracionVariable" || node.type === "ExpresionKeyword") {
        node.variables.forEach((variable) => {
          if (variablesDeclaradas[variable.name]) {
            throw new Error(`La variable ${variable.name} ya ha sido declarada`);
          }
          variablesDeclaradas[variable.name] = true;
          variableName =  variable;
        });
      }
    });
  
    // Segunda pasada: verificar asignaciones y referencias de variables
    function traverse(node) {
      if (node.type === "ExpresionAsignacion") {
        if (!variablesDeclaradas[node.name]) {
          // alert(`La variable ${node.name} no ha sido declarada`);
        }
        traverse(node.value);
      } else if (node.type === "ExpresionIdentificador") {
        if (!variablesDeclaradas[node.name]) {
          // alert(`La variable ${node.name} no ha sido declarada`);
        }
      } else if (node.type === "ExpresionKeyword") {

        if (ast.body[ast.body.indexOf(node) + 2].value.type === 'ExpresionNumerica'){

          if (variableName === 'char'){
            throw new TypeError(`Error sematico se declaro un tipo de dato: ${variableName} y se asigno un numero`);
          } else {
            // Aquí se captura el valor después del nodo DeclaracionVariable si es un numero
          const valor = ast.body[ast.body.indexOf(node) + 2].value.value;
          if (isNaN(valor)) {
            throw new TypeError(`Error sematico: ${valor} no es un numero`);
          } else {
            console.log(`La variable declarada ${variableName} es un número: ${valor}`);
          }
          }
        
        } else if  (ast.body[ast.body.indexOf(node) + 2].value.type === 'ExpresionIdentificador'){

        // Aquí se captura el valor después del nodo DeclaracionVariable si es un caracter
          const valor = ast.body[ast.body.indexOf(node) + 2].value.name;
          if (variableName === 'int'){
            throw new TypeError(`Error sematico se declaro un tipo de dato: ${variableName} y se asigno un caracter`);
          } else {
            if (isNaN(valor)) {
              console.log(`La variable declarada ${variableName} es un número: ${valor}`);
            } else {          
              throw new TypeError(`Error sematico: ${valor} no es un caracter`);
            }
          }
          
          console.log(`la variable declarada ${variableName} es ${valor}`);
        }

      } else if (node.type === "ExpresionNumerica") {
        // No hay nada que hacer ya que en earbol no se analisan los numeros
      } else if (node.type === "ExpresionObjeto") {
       // No hay nada que hacer ya que en earbol no se analisan los objetos
      } else if (node.type === "ExpresionFuncion") {
        // No hay nada que hacer ya que en earbol no se analisan las funciones
      } else if (node.type === "ExpresionOperacion") {
        // No hay nada que hacer ya que en earbol no se analisan las operaciones
      } else if (node.type === "DeclaracionVariable") {
  
          // Aquí se captura el valor después del nodo DeclaracionVariable
          const valor = ast.body[ast.body.indexOf(node) + 1].name;
  
          // Aquí se imprime el nombre de la variable más el valor después de la DeclaracionVariable
          console.log(`la variable declarada ${variableName} es ${valor}`);
      } else if (node.type === "ExpresionFin") {
        // No hay nada que hacer
      } else {
        throw new TypeError(`Tipo de nodo inesperado: ${node.type}`);
      }
    }
  
    // Llamar a traverse para cada nodo del cuerpo del AST
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
  
