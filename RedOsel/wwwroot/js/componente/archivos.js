


window.componenteArchivos = {
    template: '#compoArchivos',
    props: {
        idTipoMultimedia: {
            type: Number,
            default: 0,
            required: true
        },
        idOrigen: {
            type: Number,
            default: 0,
            required: false
        },
        esModal: {
            type: Boolean,
            default: false,
            required: false
        },
        mostrarBotonProducto: {
            type: Boolean,
            default: false,
            required: false
        }
    },
    watch: {
        idOrigen(newValue, oldValue) {
            //if (Number(newValue) !== Number(oldValue) || Number(newValue) !== 0 && Number(this.idTipoMultimedia) !== 0) {
            //    if (Number(newValue) !== Number(oldValue)) {
            //        this.limpiar(1)
            //    }      
            //}
            //if (Number(newValue) === 0 && Number(newValue) !== Number(oldValue)) {
            //    this.limpiar();
            //}
            if (Number(newValue) === 0) {
                this.limpiar();
            }
            if (Number(newValue) > 0) {
                this.getArchivos();
            }
        },
        idTipoMultimedia(newValue, oldValue) {
            if (Number(newValue) > 0 ) {
                this.getTipoMultimedia();
            }
        }
    },
    data() {
        return {
            registroUnico: false,
            idTipoClaveTipoArchivo: 0,
            descripcionMultimedia: '',
            nombreMultimedia: '',
            array: {
                archivos: [],
                tipoArchivo: [],
                productos: []
            },
            campos: {
                input: {
                    titulo: false,
                    descripcion: false,
                    orden: false,
                    imagen: false,
                    especificaciones: false,
                    fecha: false
                },
                dropDown: {
                    tipoArchivo: false
                }
            },
            extensionesPermitidas: '',
            extensionesImagenPermitidas: '',
            extension: {
                titulo: 0,
                descripcion: 0
            },
            value: {
                titulo: '',
                descripcion: '',
                orden: 0,
                fecha: ''
            },
            ddl: {
                tipoArchivo: '0',
                producto: '0'
            },
            pesoMaximoArchivo: 0,
            pesoMaximoImagen: 0,
            nuevo: false,
            archivo: null,
            idMultimedia: 0,
            descarga: '',
            nombreArchivo: '',
            nombreArchivoElegido: '',
            bgCard: 'bg-normal',
            especificacion: '',
            imagen: null,
            nombreImagenElegida: '',
            nombreImagen: '',
            descargaImagen: '',
            especificacionesImagen: '',
            show: {
                botonProducto: false,
                altaArchivo: true,
                altaProducto: false,
                cancelar: false
            },
            isOpen: false,
            selectedOptions: [],
            zIndexValue: 1050,
            displayOptions: 'none',
            icono: 'bi bi-caret-down-fill',
            filterText: ''
        }
    },
    computed: {
        // Filtered options based on the filterText
        filteredOptions() {
            const filter = this.filterText.trim().toLowerCase();

            var options = [];
            if (filter.trim() === '') {
                options = [];
            } else {
                options = this.array.productos.filter(option =>
                    option.descripcion.toLowerCase().includes(filter)
                );

                if (this.selectedOptions.length > 0) {
                    options = options.filter(i => !this.selectedOptions.find(a => a.id_producto === i.id_producto));
                }

                options = options.map(a => {
                    return {
                        ...a,
                        selected: false
                    }
                });
            }            

            if (options.length > 0) {
                this.isOpen = true;
            } else {
                this.isOpen = false;
            }

            this.displayOptions = this.isOpen ? 'block' : 'none';

            return JSON.parse(JSON.stringify(options));
        },
    },
    methods: {
        cancelaAlta() {
            if (!this.esModal) {
                this.nuevo = false;
                this.bgCard = 'bg-normal';
            } else {
                this.$emit('cerrarModal');
            }
        },
        limpiar() {
            //this.show.botonProducto = false;
            this.show.cancelar = false;
            this.value.titulo = '';
            this.value.descripcion = '';
            this.value.orden = 0;
            this.nuevo = false;
            this.archivo = null;
            this.ddl.tipoArchivo = '0';
            this.idMultimedia = 0; 
            this.descarga = '';
            this.nombreArchivo = '';
            this.bgCard = 'bg-normal';
            this.nombreArchivoElegido = '';

            this.imagen = null;
            this.nombreImagenElegida = '';
            this.nombreImagen = '';
            this.descargaImagen = '';
            this.especificacionesImagen = '';

            this.value.fecha = '';

            if (Number(this.idOrigen) === 0) {
                this.array.archivos = [];
            }
        },
        agregarArchivos(ocultaCancelar = true) {
            this.show.cancelar = ocultaCancelar;

            if (this.registroUnico) {
                if (this.array.archivos.length === 1) {
                    alerts.info(`Solo se permite un archivo para ${this.nombreMultimedia.toLowerCase()}`);
                    return;
                }
            }

            
            this.limpiar();
            this.nuevo = true;

            this.show.altaProducto = false;
            this.show.altaArchivo = true;
         
            if (!this.esModal) {
                this.bgCard = 'bg-new';
            }
        },
        getTipoMultimedia() {
            $('.cargando-c').show();
            axios.post(url + 'Catalogos/TipoMultimedia_Recupera', {
                idTipoMultimedia: this.idTipoMultimedia
            }).then(async res => {
                let ds = res.data;

                this.registroUnico = ds.registro_unico ?? false;
                this.descripcionMultimedia = ds.descripcion_multimedia;
                this.nombreMultimedia = ds.nombre_multimedia;
                this.idTipoClaveTipoArchivo = ds.id_tipo_clave_tipo_archivo ?? 0;

                this.campos.input.imagen = ds.imagen ?? false;
                this.campos.input.titulo = ds.titulo ?? false; 
                this.campos.input.orden = ds.orden ?? false;
                this.campos.input.descripcion = ds.descripcion ?? false;
                this.campos.input.especificaciones = ds.especificaciones ?? false;
                this.campos.input.fecha = ds.fecha ?? false;

                if (ds.especificaciones) {
                    this.especificacion = ds.ds_especificaciones;
                } else {
                    this.especificacion = '';
                }

                if (ds.especificaciones_imagen) {
                    this.extensionesImagenPermitidas = ds.extensiones_imagen;
                    this.pesoMaximoImagen = ds.peso_maximo_imagen;
                    this.especificacionesImagen = ds.ds_especificaciones_imagen;
                }

                this.campos.dropDown.tipoArchivo = ds.tipo_archivo;

                this.array.tipoArchivo = ds.claves;

                this.extensionesPermitidas = ds.extensiones;
                this.extension.titulo = ds.titulo_extension;
                this.extension.descripcion = ds.descripcion_extension;

                this.pesoMaximoArchivo = ds.peso_maximo;

                $('.cargando-c').hide();

                this.$emit('activa');
            }).catch(err => validError(err));
        },
        guardarArchivo() {
            let msj = '';
            if (this.campos.input.titulo && this.value.titulo.trim() === '') {
                msj += '<li>Ingrese el título</li>';
            }
            if (this.campos.input.descripcion && this.value.descripcion.trim() === '') {
                msj += '<li>Ingrese la descripción</li>';
            }
            if (this.campos.dropDown.tipoArchivo && Number(this.ddl.tipoArchivo) === 0) {
                msj += '<li>Elija el tipo de archivo</li>';
            }
            if (this.campos.input.orden) {
                if (Number(this.value.orden) < 0 || Number.isNaN(Number(this.value.orden))) {
                    msj += '<li>Ingrese el orden</li>';
                } 
            }
            if (this.campos.input.fecha && this.value.fecha.trim() === '') {
                msj += '<li>Ingrese la fecha</li>';
            } else {
                if (this.campos.input.fecha) {
                    var dt = luxon.DateTime.fromFormat(this.value.fecha, 'dd/MM/yyyy');
                    if (!dt.isValid) {
                        msj += '<li>La fecha ingresada es inválida, debe ser dd/mm/aaaa (01/01/2000)</li>';
                    }
                }                
            }
            if (this.archivo === null && Number(this.idMultimedia) === 0) {
                msj += '<li>Elija el archivo a subirse</li>';
            } else {
                if (this.archivo !== null) {
                    var ext = this.extensionesPermitidas.split(',');
                    ext = ext.filter(a => typeof a !== 'undefined');

                    ext.forEach(a => {
                        a = a.trimStart().trimEnd();
                    });
                    var a = this.archivo.name.split('.');;
                    let fileExtension = a[a.length - 1];

                    if (!ext.some(a => a.trim().toLowerCase() === `.${fileExtension.trim().toLowerCase()}`)) {
                        msj += '<li>Formato del archivo inválido</li>';
                    }
                }             
            }

            if (this.campos.input.imagen && this.imagen === null && Number(this.idMultimedia) === 0) {
                msj += '<li>Elija la imagen a subirse</li>';
            } else if (this.campos.input.imagen && this.imagen !== null) {
                var ext = this.extensionesImagenPermitidas.split(',');
                ext = ext.filter(a => typeof a !== 'undefined');

                ext.forEach(a => {
                    a = a.trimStart().trimEnd();
                });
                var a = this.imagen.name.split('.');;
                let fileExtension = a[a.length - 1];

                if (!ext.some(a => a.trim().toLowerCase() === `.${fileExtension.trim().toLowerCase()}`)) {
                    msj += '<li>Formato de imagen inválido</li>';
                }
            }

            if (msj === '') {
                var ds = new FormData();
                ds.append('archivo', this.archivo);
                ds.append('imagen', this.imagen);
                ds.append('idTipoMultimedia', this.idTipoMultimedia);
                ds.append('titulo', this.value.titulo.trim());
                ds.append('descripcion', this.value.descripcion.trim());
                ds.append('idOrigen', this.idOrigen);
                ds.append('idUsuario', mainApp.idUsuario);
                ds.append('idMultimedia', this.idMultimedia);
                ds.append('idTipoArchivo', this.ddl.tipoArchivo)
                ds.append('orden', Number(this.value.orden));
                ds.append('fecha', this.value.fecha);

                $('.cargando-c').show();
                let ruta = Number(this.idMultimedia) === 0 ? 'Archivos/MultimediaInserta' : 'Archivos/MultimediaActualiza';
                axios.post(url + ruta, ds).then(res => {
                    if (Number(this.idMultimedia) === 0) {
                        alerts.success(`Archivo ${this.nombreMultimedia.toLowerCase() } guardado`);
                    }
                    else {
                        alerts.success(`Archivo de ${this.nombreMultimedia.toLowerCase()} actualizado`);
                    }

                    if (!this.esModal) {
                        this.getArchivos();
                        this.limpiar();
                    }

                    try {
                        this.$emit('getArchivos');                     
                    } catch (e) {
                    }

                    try {
                        this.$emit('getRegistros');
                    } catch (e) {
                    }

                    $('.cargando-c').hide();
                }).catch(err => validError(err));
            } else {
                alerts.error('Verifique lo siguiente', msj);
            }
        },
        cambiaArchivo(evt) {
            if (evt.target.files.length > 0) {
                this.archivo = evt.target.files[0];

                if (this.archivo.size > this.pesoMaximoArchivo * 1024 * 1024) {
                    alerts.error('El tamaño del archivo no es permitido', `Máximo ${this.pesoMaximoArchivo} MB`);
                    this.archivo = null
                    return;
                }

                this.nombreArchivoElegido = evt.target.files[0].name;
            } else {
                this.archivo = null
                this.nombreArchivoElegido = '';
            }
        },
        getArchivos() {
            $('.cargando-c').show();
            axios.post(url + 'Archivos/MultimediaConsulta', {
                idOrigen: this.idOrigen,
                idTipoMultimedia: this.idTipoMultimedia
            }).then(res => {
                let ds = res.data;

                let ruta = ds.ruta;

                let array = ds.archivos ?? '';
                array = array === '' ? [] : typeof array === 'string' ? JSON.parse(array) : array;

                if (array.length > 0) {
                    console.log(array);
                    array = array.map(i => {
                        return {
                            ...i,
                            ruta: url + ruta + i.archivo,
                            rutaImagen: (url + ruta + i.imagen ?? '') ?? '',
                            nombreProductos: i.productos.length > 0 ? i.productos[0]?.id_producto === 0 ? 'Todos los productos' : i.productos?.map(a => a.codigo + ' - ' + a.nombre.substr(0, 20) + '...').join(`<br/>`) : ''
                        }
                    });


                }

                this.array.archivos = array;

                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        getArchivo(item) {
            $('.cargando-c').show();
            this.show.altaProducto = false;
            this.show.altaArchivo = true;


            axios.post(url + 'Archivos/MultimediaRecupera', {
                idMultimedia: item.id_multimedia,
                idTipoMultimedia: this.idTipoMultimedia
            }, {
                headers: {
                    'Authorization': 'bearer ' + sessionStorage.getItem('tokRedOsel')
                }
            }).then(res => {
                let ds = res.data;

                let data = JSON.parse(ds.multimedia);
                let ruta = ds.ruta + data.archivo;

                this.limpiar();
                this.nuevo = true;

                this.idMultimedia = data.id_multimedia;
                this.value.titulo = data.titulo;
                this.value.descripcion = data.descripcion;
                this.value.orden = data.orden;
                this.idMultimedia = data.id_multimedia;

                this.ddl.tipoArchivo = data.id_tipo_archivo.toString();

                data.fecha = data.fecha ?? '';
                this.value.fecha = data.fecha !== '' ? this.getDate(data.fecha) : '';

                this.descarga = url + ruta;
                this.nombreArchivo = data.archivo;

                this.descargaImagen = url + ds.ruta + data.imagen;
                this.nombreImagen =  data.imagen;

                if (this.esModal) {
                    this.$emit('abreModal');
                } else {
                    this.bgCard = 'bg-new';
                }
                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        eligeArchivo() {
            this.archivo = null;
            this.nombreArchivoElegido = '';

            let inputFile = document.createElement('input');
            inputFile.type = 'file';
            inputFile.accept = this.extensionesPermitidas;
            inputFile.multiple = false;

            inputFile.onchange = (evt) => {
                this.cambiaArchivo(evt);
            }
            inputFile.click();
        },
        eligeImagen() {
            this.imagen = null;
            this.nombreImagenElegida = '';

            let inputFile = document.createElement('input');
            inputFile.type = 'file';
            inputFile.accept = this.extensionesImagenPermitidas;
            inputFile.multiple = false;

            inputFile.onchange = (evt) => {
                this.cambiaImagen(evt);
            }
            inputFile.click();
        },
        cambiaImagen(evt) {
            if (evt.target.files.length > 0) {
                this.imagen = evt.target.files[0];

                if (this.imagen.size > this.pesoMaximoImagen * 1024 * 1024) {
                    alerts.error('El tamaño de la imagen no es permitido', `Máximo ${this.pesoMaximoImagen} MB`);
                    this.imagen = null
                    return;
                }

                this.nombreImagenElegida = evt.target.files[0].name;
            } else {
                this.imagen = null
                this.nombreImagenElegida = '';
            }
        },
        async eliminaArchivo(item) {
            this.show.cancelar = false;
            let res = await alerts.confirm(`¿Está seguro de eliminar <i>${!this.esModal && !this.show.cancelar ? item.archivo : item.titulo}</i>?`);
            if (res) {
                $('.cargando-c').show();
                axios.post(url + 'Archivos/MultimediaElimina', {
                    idTipoMultimedia: this.idTipoMultimedia,
                    idMultimedia: item.id_multimedia,
                    idUsuario: mainApp.idUsuario
                }).then(_ => {
                    alerts.success(`Archivo de ${this.nombreMultimedia.toLowerCase()} eliminado`);

                    if (!this.esModal && !this.show.cancelar) {
                        this.getArchivos();
                    } else {
                        try {
                            this.$emit('getArchivos');
                        } catch (e) {
                        }

                        try {
                            this.$emit('getRegistros');
                        } catch (e) {
                        }
                    }
                    $('.cargando-c').hide();
                }).catch(err => validError(err));
            }
        },
        getDate(inputDate) {
            return luxon.DateTime.fromISO(inputDate).toFormat("dd/MM/yyyy");
        },
        agregarProducto(item) {
            this.idMultimedia = item.id_multimedia;
            this.show.altaProducto = true;
            this.show.altaArchivo = false;
            this.nuevo = true;
            this.bgCard = 'bg-new';
            this.filterText = '';

            this.isOpen = false;
            this.displayOptions = this.isOpen ? 'block' : 'none';
            this.icono = this.isOpen ? 'bi bi-caret-up-fill' : 'bi bi-caret-down-fill';

            this.selectedOptions = [];
            if (item.productos.length > 0) {
                item.productos.forEach(i => {
                    var it = this.array.productos.find(a => a.id_producto === i.id_producto);
                    it.selected = true;
                    this.selectedOptions.push(it);
                });
            } else {
                this.array.productos.forEach(i => {
                    i.selected = false;
                })
                this.selectedOptions = [];
            }
        },
        toggleDropdown() {
            this.isOpen = !this.isOpen;
            this.displayOptions = this.isOpen ? 'block' : 'none';
            this.icono = this.isOpen ? 'bi bi-caret-up-fill' : 'bi bi-caret-down-fill';
        },
        closeDropDown() {
            this.displayOptions = this.isOpen ? 'block' : 'none';
            this.isOpen = false;
            this.icono = this.isOpen ? 'bi bi-caret-up-fill' : 'bi bi-caret-down-fill';
        },
        eligeOpcion(item, evt) {
            item.selected = evt.target.checked;
            if (item.selected) {
                if (this.selectedOptions.some(a => a.id_producto === 0)) {
                    this.selectedOptions = this.selectedOptions.filter(a => a.id_producto === 0);
                    this.filteredOptions.forEach(a => {
                        if (a.id_producto !== 0) {
                            a.selected = false
                        }
                    });
                    item.selected = false;
                    evt.target.checked = false;
                    return;
                }
                if (item.id_producto === 0) {
                    this.selectedOptions = [];
                    this.filteredOptions.forEach(a => {
                        if (a.id_producto !== 0) {
                            a.selected = false
                        }
                    });
                }
                this.selectedOptions.push(item)
            } else {
                this.selectedOptions = this.selectedOptions.filter(a => a !== item);
            }
        },
        getProductos() {
            $('.cargando-c').show();
            axios.post(url + 'Productos/ProductosConsulta', {
                idFamilia: 0,
                nombre: '',
                codigo: ''
            }, {
                headers: {
                    'Authorization': 'bearer ' + sessionStorage.getItem('tokRedOsel')
                }
            }).then(res => {
                let ds = res.data;


                ds.push({
                    id_producto: 0,
                    idNaturaleza: 1,
                    tipoNaturaleza: 0,
                    nombre: 'Todos los productos',
                    familia: '',
                    codigo: ''
                })

                ds = ds.filter(a => a.idNaturaleza ?? 0 !== 0);
                this.array.productos = ds.sort((a, b) => {
                    //return a.tipoNaturaleza - b.tipoNaturaleza;

                    // First, group by id (ascending order)
                    if (a.tipoNaturaleza !== b.tipoNaturaleza) {
                        return a.tipoNaturaleza - b.tipoNaturaleza;
                    }
                    // Then, sort alphabetically by name (ascending order)
                    return a.nombre.localeCompare(b.nombre);
                });


                this.array.productos = this.array.productos.map(a => {
                    return {
                        ...a,
                        descripcion: a.familia + ' - ' + a.codigo + ' - ' + a.nombre.toUpperCase(),
                        selected: false
                    }
                })
                //console.log(this.array.productos);
                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        guardarProductos() {
            if (this.selectedOptions.length === 0) {
                this.cancelaAlta();
                return;
            }

            let productos = this.selectedOptions.map(a => {
                return {
                    idProducto: a.id_producto
                }
            });


            $('.cargando-c').show();
            axios.post(url + 'Archivos/MultimediaProductosInserta', {
                idOrigen: this.idMultimedia,
                producto: productos,
                idUsuario: mainApp.idUsuario
            }).then(a => {
                alerts.success('Productos guardados');

                this.cancelaAlta();
                this.getArchivos();
            }).catch(err => validError(err));
        },
        elimina(item) {
            this.selectedOptions.splice(item, 1);
        }
    },
    created() {
        this.show.botonProducto = this.mostrarBotonProducto;
        if (this.show.botonProducto) {
            this.getProductos();
        }    

        if (Number(this.idTipoMultimedia) > 0) {
            this.getTipoMultimedia();
        }
    },
    mounted() {
        //this.getTipoMultimedia();
    }
};
