
function replaceChars(entry, Remplazar, PorCaracter) {
    out = Remplazar.toString(); // remplaza este 
    add = PorCaracter; // con este
    temp = "" + entry; // 
    while (temp.indexOf(out) > -1) {
        pos = temp.indexOf(out);
        temp = "" + (temp.substring(0, pos) + add + temp.substring((pos + out.length), temp.length));
    }
    return temp;
}// fin de replaceChars


function recuperaElemento(tipo, nombre) {
    var formulario = document.forms[0];
    var elementos = formulario.elements;
    var nombreElemento = "";
    var elemento;

    for (a = 0; a < elementos.length; a++) {
        if (elementos[a].type == tipo) {
            nombreElemento = elementos[a].name;
            if (nombreElemento.indexOf(nombre) != -1) {
                return elementos[a];
            }//if
        }//if
    }//for
}//function    




function mascara2(obj, tipoCampo, valor, tipo) {
    //alert ("ENTRA");
    var ubicacion;
    var valuNuevo = "";
    var enter = "\n";
    var caracteres = "";
    var pos;
    var bandera = false;
    var num_caracteres = 0;
    //var obj;
    pos = obj.selectionStart;

    /*Tipo_campo debe ser 'text','select-one'(combos),'hidden'*/
    //obj = recuperaElemento(tipoCampo, nbcampo);

    /* nombres = 1, numeros = 2, dir.c correo = 3, Fechas = 4, 5 = Enteros Positivos, 6=Decimales enteros*/
    switch (tipo) {
        //if(tipo == 1) 
        case 1:
            caracteres = "-_abcdefghijklmnopqrstuvwxyzñ1234567890 (){}[].,ABCDEFGHIJKLMNOPQRSTUVWXYZÑáéíóúÁÉÍÓÚ" + String.fromCharCode(13) + enter;
            break;
            //if(tipo == 2) 
        case 2:
            caracteres = ".1234567890-" + String.fromCharCode(13) + enter;
            break;
            //if(tipo == 3) 
        case 3:
            caracteres = "-_abcdefghijklmnopqrstuvwxyzñ1234567890 .ABCDEFGHIJKLMNOPQRSTUVWXYZÑ@/" + String.fromCharCode(13) + enter;
            break;
            //if(tipo == 4) 
        case 4:
            caracteres = "1234567890" + String.fromCharCode(13) + enter;
            break;
        case 5:
            caracteres = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ#abcdefghijklmnopqrstuvwxyz" + String.fromCharCode(13) + enter;
            break;
        case 6:
            caracteres = "1234567890.01234156789," + String.fromCharCode(13) + enter;
            break;
        case 7:
            caracteres = "1234567890," + String.fromCharCode(13) + enter;
            break;
        case 8:
            caracteres = "1234567890." + String.fromCharCode(13) + enter;
            break;
        case 9:
            caracteres = "an1234567890AN" + String.fromCharCode(13) + enter;
            break;
        case 10:
            caracteres = "1234567890/" + String.fromCharCode(13) + enter;
            break;
        case 11:
            caracteres = "1234567890:" + String.fromCharCode(13) + enter;
            break;  
        case 12:
            caracteres = "()+-.1234567890abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ,áéíóúüÁÉÍÓÚÜ" + String.fromCharCode(13) + enter;
            break;


    }

    for (var i = 0; i <= valor.toString().length; i++) {

        ubicacion = valor.substring(i, i + 1);

        if (caracteres.indexOf(ubicacion) == -1) {

            //eval("document.forms[0]." + nbcampo + ".focus()");
            obj.focus();
            //valuNuevo = replaceChars(eval("document.forms[0]." + nbcampo + ".value"), ubicacion, '');
            valuNuevo = replaceChars(obj.value, ubicacion, '');
            //eval("document.forms[0]." + nbcampo + ".value = " + "'" + valuNuevo + "'");
            obj.value = valuNuevo;
            num_caracteres++;
            bandera = true;
        }
    }

    //if(tipo == 2 && isNaN(eval("document.forms[0]." + nbcampo + ".value")))
    if (tipo == 2 && isNaN(obj.value)) {
        //alert('Error de formato, corrija el valor');
        //eval("document.forms[0]." + nbcampo + ".focus()");
        obj.focus();
        return false;
    }
    if (bandera) {
        obj.selectionStart = pos - num_caracteres;
        obj.selectionEnd = pos - num_caracteres;
    }
    else {
        obj.selectionStart = pos;
        obj.selectionEnd = pos;
    }
    return true;
}


function recuperaElementoDocumento(documento, tipo, nombre) {
    var formulario = documento.forms[0];
    var elementos = formulario.elements;
    var nombreElemento = "";
    var elemento;

    for (a = 0; a < elementos.length; a++) {
        if (elementos[a].type == tipo) {
            nombreElemento = elementos[a].name;
            if (nombreElemento.indexOf(nombre) != -1) {
                return elementos[a];
            }//if
        }//if
    }//for
}//function


function formatNumber(num, prefix) {
    prefix = prefix || '';
    num += '';
    var splitStr = num.toString().split('.');
    var splitLeft = splitStr[0];
    var splitRight = splitStr.length > 1 ? '.' + splitStr[1] : '';
    //var regx = /(\d+)(\d{2})/;
    var regx = /(\d)(?=(\d{3})+(?!\d))/g;
    while (regx.test(splitLeft)) {
        //splitLeft = splitLeft.replace(regx, '$1' + ',' + '$2');
        splitLeft = splitLeft.replace(regx, '$1' + ',');
    }
    if (num.indexOf('.') < 0) {
        return prefix + splitLeft + splitRight + '.00';

    }
    else {
        return prefix + splitLeft + splitRight;
    }
}
function unformatNumber(num) {
    return num.toString().replace(/([^0-9\.\-])/g, '') * 1;
}
function formatNumericField(field) {
    field.value = formatNumber(field.value);
    return true;
}

function zfill(number, width) {
    var numberOutput = Math.abs(number); /* Valor absoluto del número */
    var length = number.toString().length; /* Largo del número */
    var zero = "0"; /* String de cero */

    if (width <= length) {
        if (number < 0) {
            return ("-" + number.toString());
        } else {
            return number.toString();
        }
    } else {
        if (number < 0) {
            return ("-" + (zero.repeat(width - length)) + number.toString());
        } else {
            return ((zero.repeat(width - length)) + number.toString());
        }
    }
}



function sortObjectsByString(array, key, asc = true, split = false, index = 0, splitChar = ' ') {
    if (typeof array !== 'object') {
        alert('"array" debe ser tipo Array')
        throw Error('"array" debe ser tipo Array')
    }
    if (typeof key !== 'string') {
        alert('"key" debe ser tipo String')
        throw Error('"key" debe ser tipo String')
    }

    if (typeof asc !== 'boolean') {
        alert('"asc" debe ser tipo Boolean')
        throw Error('"asc" debe ser tipo Boolean')
    }

    if (split) {
        return array.sort((a, b) => {
            let newA = a[key]?.trim().replace(/' '/g, '')?.split(splitChar)[index] ?? '';
            let newB = b[key]?.trim().replace(/' '/g, '')?.split(splitChar)[index] ?? '';
            if (asc) {
                return newB.toLocaleLowerCase().trim().localeCompare(newA.toLocaleLowerCase().trim());
            } else {
                return newA.toLocaleLowerCase().trim().localeCompare(newB.toLocaleLowerCase().trim());
            }
        });
    } else {
        return array.sort((a, b) => {
            let newA = a[key] ?? '';
            let newB = b[key] ?? '';
            if (asc) {
                return newB.toLocaleLowerCase().trim().localeCompare(newA.toLocaleLowerCase().trim());
            } else {
                return newA.toLocaleLowerCase().trim().localeCompare(newB.toLocaleLowerCase().trim());
            }
        });
    }

}

function sortObjectByNumber(array, key, asc = true) {
    if (typeof array !== 'object') {
        alert('"array" debe ser tipo Array')
        throw Error('"array" debe ser tipo Array')
    }
    if (typeof key !== 'string') {
        alert('"key" debe ser tipo String')
        throw Error('"key" debe ser tipo String')
    }

    if (typeof asc !== 'boolean') {
        alert('"asc" debe ser tipo Boolean')
        throw Error('"asc" debe ser tipo Boolean')
    }

    const unformat = (num) => {
        return Number(num.toString().trim().replace(/([^0-9\.\-])/g, '')) || 0;
    }

    return array.sort((a, b) => {
        let newA = a[key] ?? '0';
        let newB = b[key] ?? '0';

        // Ensure the values are treated as numbers
        // Unformat and convert to number
        let numA = 0, numB = 0;
        if (typeof newA === 'boolean' && typeof newB === 'boolean') {
            numA = Number(newA);
            numB = Number(newB);
        } else {
            numA = unformat(newA.toString());
            numB = unformat(newB.toString());
        }

        if (asc) {
            return numB - numA;
        } else {
            return numA - numB;
        }
    });
}

function sortOBjectByDate(array, key, asc = true, type = 0, convertFromISODate = false) {
    if (typeof array !== 'object') {
        alert('"array" debe ser tipo Array')
        throw Error('"array" debe ser tipo Array')
    }
    if (typeof key !== 'string') {
        alert('"key" debe ser tipo String')
        throw Error('"key" debe ser tipo String')
    }

    if (typeof asc !== 'boolean') {
        alert('"asc" debe ser tipo Boolean')
        throw Error('"asc" debe ser tipo Boolean')
    }

    if (typeof luxon === 'undefined' || typeof luxon?.DateTime === 'undefined') {
        alert('sortOBjectByDate() requiere luxon.js')
        throw Error("Requiere luxon.js");
    }


    let format = '';
    switch (type) {
        case 0:
            format = 'dd/MM/yyyy';
            break;
        default:
            format = 'dd/MM/yyyy';
            break;
    }

    return array.sort((a, b) => {
        a[key] = a[key] ?? '';
        b[key] = b[key] ?? '';

        let newA, newB;
        if (convertFromISODate) {
            newA = luxon.DateTime.fromISO(a[key]);
            newB = luxon.DateTime.fromISO(b[key]);
        } else {
            newA = luxon.DateTime.fromFormat(a[key], format);
            newB = luxon.DateTime.fromFormat(b[key], format);
        }

        if (asc) {
            return newB.toMillis() - newA.toMillis();
        } else {
            return newA.toMillis() - newB.toMillis();
        }
    });
}