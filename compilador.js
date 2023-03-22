function compilar() {
  const codigo = document.getElementById("codigo").value;
  const tokens = analizarLexico(codigo);
  const arbolSintaxis = analizarSintaxis(tokens);
  console.log(arbolSintaxis)
  const tablaSimbolos = analizarSemantica(arbolSintaxis);
  const codigoObjeto = generarCodigo(arbolSintaxis, tablaSimbolos);
  mostrarAnalisisLexico(tokens);
  mostrarAnalisisSintactico(arbolSintaxis);
  mostrarAnalisisSemantico(tablaSimbolos);
  mostrarCodigoObjeto(codigoObjeto);
}

function analizarLexico(codigo) {
  const tokens = [];
  const palabrasReservadas = [
    "if",
    "else",
    "while",
    "for",
    "return",
    "int",
    "float",
    "char",
    "bool",
  ];
  const expresionesRegulares = [
    { tipo: "ENTERO", patron: /^\d+/ },
    { tipo: "DECIMAL", patron: /^\d+\.\d+/ },
    { tipo: "IDENTIFICADOR", patron: /^[a-zA-Z]+[a-zA-Z0-9]*/ },
    { tipo: "ASIGNACION", patron: /^=/ },
    { tipo: "PARENTESIS_IZQUIERDO", patron: /^\(/ },
    { tipo: "PARENTESIS_DERECHO", patron: /^\)/ },
    { tipo: "LLAVE_IZQUIERDA", patron: /^{/ },
    { tipo: "LLAVE_DERECHA", patron: /^}/ },
    { tipo: "CORCHETE_IZQUIERDO", patron: /^\[/ },
    { tipo: "CORCHETE_DERECHO", patron: /^]/ },
    { tipo: "SUMA", patron: /^\+/ },
    { tipo: "RESTA", patron: /^-/ },
    { tipo: "MULTIPLICACION", patron: /^\*/ },
    { tipo: "DIVISION", patron: /^\// },
    { tipo: "MENOR", patron: /^</ },
    { tipo: "MAYOR", patron: /^>/ },
    { tipo: "MENOR_O_IGUAL", patron: /^<=/ },
    { tipo: "MAYOR_O_IGUAL", patron: /^>=/ },
    { tipo: "IGUALDAD", patron: /^==/ },
    { tipo: "DISTINTO", patron: /^!=/ },
    { tipo: "AND", patron: /^&&/ },
    { tipo: "OR", patron: /^\|\|/ },
    { tipo: "NOT", patron: /^!/ },
    { tipo: "PUNTO_Y_COMA", patron: /^;/ },
    { tipo: "COMA", patron: /^,/ },
    { tipo: "FIN_ARCHIVO", patron: /^$/ },
  ];

  let linea = 1;
  let columna = 1;
  while (codigo.length > 0) {
    //debugger
    let match = null;
    for (let i = 0; i < expresionesRegulares.length; i++) {
      const expresion = expresionesRegulares[i];
      match = codigo.match(expresion.patron);
      if (match) {
        const valor = match[0];
        codigo = codigo.slice(valor.length);
        columna += valor.length;
        if (
          expresion.tipo === "IDENTIFICADOR" &&
          palabrasReservadas.includes(valor)
        ) {
          tokens.push({ tipo: valor.toUpperCase(), valor, linea, columna });
        } else {
          tokens.push({ tipo: expresion.tipo, valor, linea, columna });
        }
        break;
      }
    }
    if (!match) {
      const caracter = codigo[0];
      codigo = codigo.slice(1);
      columna++;
      if (caracter === "\n") {
        linea++;
        columna = 1;
      }
      tokens.push({ tipo: "DESCONOCIDO", valor: caracter, linea, columna });
    }
  }

  return tokens;
}

//bien

function analizarSintaxis(tokens) {
  let indice = 0;

  function consumir(tipo) {
    if (tokens[indice].tipo && tokens[indice].tipo === tipo) {
      indice++;
    } else {
      throw new Error(
        `Error de sintaxis en la línea ${tokens[indice].linea}, columna ${tokens[indice].columna}: se esperaba ${tipo}, pero se encontró ${tokens[indice].tipo}`
      );
    }
  }

  function programa() {
 

    while (tokens[indice].tipo && tokens[indice].tipo !== "FIN_ARCHIVO") {  //FIN_ARCHIVO
      declaracion();
      consumir("PUNTO_Y_COMA");
    }
  }

  function declaracion() {
    // try {
      if (
        tokens[indice] &&
        (tokens[indice].tipo === "ENTERO" ||
          tokens[indice].tipo === "DECIMAL" ||
          tokens[indice].tipo === "IDENTIFICADOR" ||
          tokens[indice].tipo === "BOOL")
      ) {
        
        const tipo = tokens[indice].tipo;
      consumir(tipo);
      if (tokens[indice] && tokens[indice].tipo === "IDENTIFICADOR") {
        const identificador = tokens[indice].valor;
        consumir("IDENTIFICADOR");
        if (tokens[indice] && tokens[indice].tipo === "ASIGNACION") {
          consumir("ASIGNACION");
          // Falta la lógica para hacer una asignación de valor
        }
      } else {
        throw new Error(
          `Error de sintaxis en la línea ${tokens[indice].linea}, columna ${tokens[indice].columna}: se esperaba un identificador después del tipo, pero se encontró ${tokens[indice].tipo}`
        );
      }
    }
      programa();
    // } catch (error) {
    //   console.error(error);
    // }
  }

  function bloque() {
    consumir("LLAVE_IZQUIERDA");
    while (tokens[indice].tipo !== "LLAVE_DERECHA") {
      declaracion();
    }
    consumir("LLAVE_DERECHA");
  }

  function expresion() {
    termino();
    while (tokens[indice].tipo === "SUMA" || tokens[indice].tipo === "RESTA") {
      consumir(tokens[indice].tipo);
      termino();
    }
  }

  function termino() {
    factor();
    while (
      tokens[indice].tipo === "MULTIPLICACION" ||
      tokens[indice].tipo === "DIVISION"
    ) {
      consumir(tokens[indice].tipo);
      factor();
    }
  }

  function factor() {
    if (
      tokens[indice].tipo === "ENTERO" ||
      tokens[indice].tipo === "DECIMAL" ||
      tokens[indice].tipo === "IDENTIFICADOR"
    ) {
      consumir(tokens[indice].tipo);
    } else if (tokens[indice].tipo === "PARENTESIS_IZQUIERDO") {
      consumir("PARENTESIS_IZQUIERDO");
      expresion();
      consumir("PARENTESIS_DERECHO");
    } else {
      throw new Error(
        `Error de sintaxis en la línea ${tokens[indice].linea}, columna ${tokens[indice].columna}: se esperaba un número, una variable o un paréntesis, pero se encontró ${tokens[indice].tipo}`
      );
    }
  }

  programa();
  return tokens
}

function analizarSemantica(ast) {

    console.log(ast);
  const variables = {};

  function analizarNodo(nodo) {
    switch (nodo.tipo) {
      case "PROGRAMA":
        nodo.declaraciones.forEach(analizarNodo);
        break;
      case "DECLARACION":
        if (nodo.tipoVariable in variables) {
          throw new Error(
            `Error semántico en la línea ${nodo.linea}, columna ${nodo.columna}: la variable "${nodo.identificador}" ya ha sido declarada`
          );
        } else {
          variables[nodo.identificador] = nodo.tipoVariable;
        }
        if (nodo.expresion) {
          analizarNodo(nodo.expresion);
        }
        break;
      case "ASIGNACION":
        if (!(nodo.identificador in variables)) {
          throw new Error(
            `Error semántico en la línea ${nodo.linea}, columna ${nodo.columna}: la variable "${nodo.identificador}" no ha sido declarada`
          );
        } else {
          const tipoVariable = variables[nodo.identificador];
          const tipoExpresion = analizarNodo(nodo.expresion);
          if (tipoVariable !== tipoExpresion) {
            throw new Error(
              `Error semántico en la línea ${nodo.linea}, columna ${nodo.columna}: no se puede asignar una expresión de tipo "${tipoExpresion}" a una variable de tipo "${tipoVariable}"`
            );
          }
        }
        break;
      case "ENTERO":
        return "ENTERO";
      case "IDENTIFICADOR":
        if (!(nodo.valor in variables)) {
          throw new Error(
            `Error semántico en la línea ${nodo.linea}, columna ${nodo.columna}: la variable "${nodo.valor}" no ha sido declarada`
          );
        } else {
          return variables[nodo.valor];
        }
      case "SUMA":
      case "RESTA":
      case "MULTIPLICACION":
      case "DIVISION":
        const tipoIzquierdo = analizarNodo(nodo.izquierdo);
        const tipoDerecho = analizarNodo(nodo.derecho);
        if (tipoIzquierdo !== "ENTERO" || tipoDerecho !== "ENTERO") {
          throw new Error(
            `Error semántico en la línea ${nodo.linea}, columna ${nodo.columna}: se esperaba una expresión de tipo "ENTERO"`
          );
        }
        return "ENTERO";
    }
  }

  analizarNodo(ast);
  return ast
}

function generarCodigo(nodo, tablaSimbolos) {
    // let codigo = "";

    // switch (nodo.tipo) {
    //   case "PROGRAMA":
    //     for (let i = 0; i < nodo.hijos.length; i++) {
    //       codigo += generarCodigo(nodo.hijos[i], tablaSimbolos);
    //     }
    //     break;
  
    //   case "DECLARACION":
    //     codigo += `${nodo.valor} `;
    //     codigo += generarCodigo(nodo.hijos[0], tablaSimbolos);
    //     codigo += ";\n";
    //     break;
  
    //   case "ASIGNACION":
    //     codigo += `${nodo.valor} = `;
    //     codigo += generarCodigo(nodo.hijos[0], tablaSimbolos);
    //     codigo += ";\n";
    //     break;
  
    //   case "OPERACION":
    //     codigo += generarCodigo(nodo.hijos[0], tablaSimbolos);
    //     codigo += ` ${nodo.valor} `;
    //     codigo += generarCodigo(nodo.hijos[1], tablaSimbolos);
    //     break;
  
    //   case "VALOR":
    //     if (nodo.tipoDato === "IDENTIFICADOR") {
    //       codigo += `${nodo.valor}`;
    //     } else if (nodo.tipoDato === "BOOLEANO") {
    //       codigo += nodo.valor === "verdadero" ? "true" : "false";
    //     } else {
    //       codigo += nodo.valor;
    //     }
    //     break;
  
    //   default:
    //     throw new Error(`Tipo de nodo desconocido: ${nodo.tipo}`);
    // }
  
    // return codigo;
}

function mostrarAnalisisLexico(tokens) {
  const resultado = tokens
    .map((token) => `[${token.tipo}: ${token.valor}]`)
    .join("\n");
  document.getElementById("lexico").textContent = resultado;
}

function mostrarAnalisisSintactico(arbolSintaxis) {
  const resultado = JSON.stringify(arbolSintaxis, null, 2);
  document.getElementById("sintactico").textContent = resultado;
}

function mostrarAnalisisSemantico(tablaSimbolos) {
  const resultado = JSON.stringify(tablaSimbolos, null, 2);
  document.getElementById("semantico").textContent = resultado;
}

function mostrarCodigoObjeto(codigoObjeto) {
  document.getElementById("codigo-objeto").textContent = codigoObjeto;
}


const darkModeToggle = document.querySelector('#dark-mode-toggle');
const body = document.body;

darkModeToggle.addEventListener('click', () => {
  body.classList.toggle('dark-mode');
})  