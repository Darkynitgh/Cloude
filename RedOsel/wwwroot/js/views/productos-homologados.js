


Vue.createApp({
    components: {
        Certificacion: window.componenteArchivos
    },
    data() {
        return {
            icono: 'lnr lnr-chevron-down',
            array: {
                productos: [],
                registros: [],
                certificados: []
            },
            value: {
                nombreFiltro: '',
                nombre: '',
                descripcion: '',
                producto: '',
                orden: ''
            },
            check: {
                publicado: false,
                publicadoRegistro: false
            },
            //Variables filtro en tablas
            iconoAsc: 'bi bi-caret-up',
            iconoDesc: 'bi bi-caret-down',
            iconoAscFill: 'bi bi-caret-up-fill',
            iconoDescFill: 'bi bi-caret-down-fill',
            sorted: {
                nombre: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                },
                url: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                },
                publicado: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                }
            },
            ////////
            idProductoHomologado: 0,
            tituloModal: '',
            nombreArchivoMini: '',
            fileMini: null,
            nombreArchivo: '',
            file: null,
            logo: '',
            hrefLogo: '',
            logoMini: '',
            hrefLogoMini: '',
            tipoMultimedia: {
                certificacion: 14
            },
            disabled: {
                certificacion: true
            },
            show: {
                registros: true,
                certificados: false,
                productos: false,
                registro: false
            },
            idProductoHomologadoRegistro: 0,
            idProductoHomologadoProducto: 0
        }
    },
    methods: {
        abreAcordion() {
            if (this.icono.indexOf('down') !== -1) {
                this.icono = 'lnr lnr-chevron-up';
            } else {
                this.icono = 'lnr lnr-chevron-down';
            }
        },
        limpiar(opcion = 0) {
            if (opcion === 0) {
                this.value.nombreFiltro = '';
            } else {
                this.idProductoHomologado = 0;
                this.nombreArchivo = '';
                this.file = null;
                this.hrefLogo = '';
                this.nombreArchivoMini = '';
                this.fileMini = null;
                this.hrefLogoMini = '';
                this.disabled.certificacion = true;
                this.value.nombre = '';
                tinymce.get('taDescripcion').setContent('');
                this.check.publicado = false;

                this.logo = '';
                this.logoMini = '';
            }
        },
        agregaArchivo(opcion = 0) {
            var fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.png, .jpg, .jpeg, .webp';
            fileInput.multiple = false;

            if (opcion === 0) {
                this.fileMini = null;
                this.nombreArchivoMini = '';

                fileInput.onchange = (evt) => {
                    if (evt.target.files.length > 0) {
                        this.nombreArchivoMini = evt.target.files[0].name;
                        this.fileMini = evt.target.files[0];
                    }
                };

                fileInput.click();
            } else {
                this.file = null;
                this.nombreArchivo = '';

                fileInput.onchange = (evt) => {
                    if (evt.target.files.length > 0) {
                        this.nombreArchivo = evt.target.files[0].name;
                        this.file = evt.target.files[0];
                    }
                };

                fileInput.click();
            }
        },
        agregaHomologacion() {
            this.limpiar(1);
            this.tituloModal = 'Nueva Homologación';
            this.$refs.btnDescripcion.click();
            $(this.$refs.modalEmpresa).modal('show');
        },
        getHomos() {
            $('.cargando-c').show();

            this.array.productos = [];

            axios.post(url + 'ProductosHomologados/Consulta', {
                nombre: this.value.nombreFiltro.trim()
            }).then(res => {
                //console.log(res.data.length);
                if (res.data.length > 0) {
                    this.array.productos = res.data;
                }

                for (const i in this.sorted) {
                    this.sorted[i].asc = false;
                    this.sorted[i].iconoAsc = this.iconoAsc;
                    this.sorted[i].iconoDesc = this.iconoDesc;
                }

                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        getHomo(item) {
            $('.cargando-c').show();
            axios.post(url + 'ProductosHomologados/Recupera', {
                idProductoHomologado: item.id_producto_homologado
            }).then(res => {
                let ds = res.data;
                this.limpiar(1);
                this.tituloModal = 'Edición Homologación';

                this.disabled.certificacion = false;
                this.idProductoHomologado = 0;
                this.idProductoHomologado = ds.id_producto_homologado;
                this.value.nombre = ds.nombre;
                tinymce.get('taDescripcion').setContent(ds.descripcion);
                this.check.publicado = ds.publicado ?? false;

                this.hrefLogo = url + ds.directorio + ds.logo;
                this.hrefLogoMini = url + ds.directorio + ds.logo_mini;

                this.logo = ds.logo;
                this.logoMini = ds.logo_mini;

                this.getRegistros();

                this.$refs.btnDescripcion.click();
                $(this.$refs.modalEmpresa).modal('show');

                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        async homoElimina(item) {
            let res = await alerts.confirm(`¿Está seguro de eliminar la homologación <i><u>${item.nombre}</i></u>?`);
            if (res) {
                $('.cargando-c').show();
                axios.post(url + 'ProductosHomologados/Elimina', {
                    idProductoHomologado: item.id_producto_homologado,
                    idUsuario: mainApp.idUsuario
                }).then(res => {

                    alerts.success('Homologación eliminada');

                    this.getHomos();
                    $('.cargando-c').hide();
                }).catch(err => validError(err));
            }
        },
        guardar() {
            let msj = '';

            if (this.value.nombre.trim() === '') {
                msj += '<li>Ingrese el nombre de la organización</li>';
            }
            if (this.nombreArchivoMini.trim() === '' && Number(this.idProductoHomologado) === 0) {
                msj += '<li>Elija un logo mini</li>';
            }
            if (this.nombreArchivo.trim() === '' && Number(this.idProductoHomologado) === 0) {
                msj += '<li>Elija el logo</li>';
            }
            if (tinymce.get('taDescripcion').getContent() === '') {
                msj += '<li>Ingrese la descripción</li>';
            }

            if (msj === '') {
                $('.cargando-c').show();

                var ds = new FormData();

                ds.append('idProductoHomologado', this.idProductoHomologado);
                ds.append('log', this.logo.trim());
                ds.append('logMini', this.logoMini.trim());
                ds.append('nombre', this.value.nombre.trim());
                ds.append('descripcion', tinymce.get('taDescripcion').getContent());
                ds.append('logo', this.file);
                ds.append('logoMini', this.fileMini);
                ds.append('publicado', this.check.publicado);
                ds.append('idUsuario', mainApp.idUsuario);

                let ruta = Number(this.idProductoHomologado) === 0 ? 'ProductosHomologados/Inserta' : 'ProductosHomologados/Actualiza';

                axios.post(url + ruta, ds).then(res => {
                    $('.cargando-c').hide();
                    //$(this.$refs.modalEmpresa).modal('hide');

                    if (Number(this.idProductoHomologado) === 0) {
                        alerts.success('Homologación guardada');
                        this.idProductoHomologado = res.data;
                        this.disabled.certificacion = false;

                        this.getHomo({ id_producto_homologado: res.data });
                    } else {
                        alerts.success('Homologación actualizada');
                    }

                    this.getHomos();
                }).catch(err => validError(err));
            } else {
                alerts.error('Verifique lo siguiente', msj);
            }
        },
        init() {
            let initOpcions = {
                selector: '#taDescripcion',
                plugins: 'contextmenu print preview paste image searchreplace autolink save directionality code visualblocks visualchars fullscreen link codesample table charmap hr pagebreak anchor toc insertdatetime advlist lists wordcount  textpattern help charmap emoticons importcss',
                menubar: 'file edit view insert format tools table help',
                toolbar: 'undo redo code | table image | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview print | link anchor | ltr rtl',
                language: 'es_MX',
                importcss_append: true,
                content_css: ['/redosel/lib/bootstrap/dist/css/bootstrap.min.css'],
                height: 500,
                quickbars_selection_toolbar: 'bold italic | link blockquote',
                toolbar_mode: 'sliding',
                convert_urls: false,
                contextmenu: 'bold italic underline | link',
                file_picker_types: 'image',
                image_caption: true,
                file_picker_callback: (callback, value, meta) => {
                    // Provide image and alt text for the image dialog
                    if (meta.filetype == 'image') {
                        var input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.png, .jpg';
                        input.multiple = false;

                        input.onchange = (evt) => {
                            var imagen = evt.target.files[0];

                            if (imagen.size > 1 * 1024 * 1024) {
                                alert('El tamaño de la imagen no es permitido, máximo 1 MB');
                                input.value = '';
                                return;
                            }

                            var ext = '.png, .jpg, .jpeg'.split(',');
                            ext = ext.filter(a => typeof a !== 'undefined');

                            ext.forEach(a => {
                                a = a.trimStart().trimEnd();
                            });
                            var a = imagen.type.split('/');;
                            let fileExtension = a[a.length - 1];

                            if (!ext.some(a => a.trim() === `.${fileExtension}`)) {
                                alert('Formato del archivo inválido');
                                input.value = '';
                                return;
                            }

                            var ds = new FormData();
                            ds.append('archivo', imagen);

                            $('.cargando-c').show();
                            axios.post(url + 'Archivos/Imagen', ds).then(res => {
                                let ds = res.data;

                                $('.cargando-c').hide();
                                callback(url + ds.rutaServidor, { alt: imagen.name });
                            }).catch(err => alert(err));
                        }

                        input.click();
                    }
                }
            }

            tinymce.init(initOpcions);
        },
        insertaRegistro() {
            $('.cargando-c').show();
            axios.post(`${url}ProductosHomologados/RegistroInserta`, {
                idProductoHomologado: this.idProductoHomologado,
                idUsuario: mainApp.idUsuario
            }).then(_ => {
                alerts.success('Registro agregado');
                this.getRegistros();

           /*     $(this.$refs.modalEmpresa).modal('hide');*/
                setTimeout(_ => {
                    $(this.$refs.modalEmpresa).modal('show');
                }, 250);
                $('.cargando-c').hide();
            }).catch(error => validError(error));
        },
        getRegistros() {
            this.array.registros = [];

            $('.cargando-c').show();
            axios.post(`${url}ProductosHomologados/RegistroConsulta`, {
                idProductoHomologado: this.idProductoHomologado
            }).then(res => {

                if (res.data.length > 0) {
                    this.array.registros = res.data?.map(i => {
                        return {
                            ...i,
                            certificaciones: i?.certificaciones?.map(j => {
                                return {
                                    ...j,
                                    href: `${url}archivos/multimedia/${j.id_tipo_multimedia}/${j.archivo}`
                                };
                            })
                        };
                    });
                }         

                this.idProductoHomologadoProducto = 0;
                this.idProductoHomologadoRegistro = 0;
                this.show.registros = true;
                this.show.productos = false;
                this.show.certificados = false;
                this.show.registro = false;

                setTimeout(_ => {
                    $(this.$refs.modalEmpresa).modal('handleUpdate');
                }, 1000);

                //console.log(this.array.registros);

                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        async eliminaRegistro(item) {
            let res = await alerts.confirm(`<p class="m-0 p-0 text-center">¿Está seguro de eliminar el registro?</p>`);
            if (res) {
                $('.cargando-c').show();
                axios.post(`${url}ProductosHomologados/RegistroElimina`, {
                    idProductoHomologadoRegistro: item.id_producto_homologado_registro
                }).then(res => {

                    alerts.success('Registro eliminado');
                    this.getRegistros();

                    $('.cargando-c').hide();
                }).catch(err => validError(err));
            }
        },
        altaProductos(item) {
            this.idProductoHomologadoRegistro = item.id_producto_homologado_registro;
            this.idProductoHomologadoProducto = 0;
            this.show.registros = false;
            this.show.productos = true;
            this.show.registro = false;
            this.show.certificados = false;
            this.value.producto = '';
        },
        getProductos(item) {
            $('.cargando-c').show();
            this.idProductoHomologadoProducto = item.id_producto_homologado_producto;
            this.show.registros = false;
            this.show.productos = true;
            this.show.registro = false;
            this.show.certificados = false;
            this.value.producto = item.producto;
            $('.cargando-c').hide();
        },
        async productoElimina(item) {
            let res = await alerts.confirm(`¿Está seguro de eliminar el producto "${item.producto}"?`);
            if (res) {
                $('.cargando-c').show();
                axios.post(`${url}ProductosHomologados/ProductoAsociadoElimina`, {
                    idProductoHomologadoProducto: item.id_producto_homologado_producto
                }).then(_ => {
                    alerts.success('Producto eliminado');

                    this.getRegistros();
                    $('.cargando-c').hide();
                }).catch(err => {
                    validError(err)
                })
            }
        },
        guardaProducto() {
            let msj = '';

            if (this.value.producto.trim() === '') {
                msj += 'Ingrese el nombre del producto';
            }

            if (msj.trim() !== '') {
                alerts.error('Verifique lo siguiente', msj);
            } else {
                let ruta = Number(this.idProductoHomologadoProducto) === 0 ? 'ProductosHomologados/ProductoAsociadoInserta' : 'ProductosHomologados/ProductoAsociadoActualiza';

                $('.cargando-c').show();
                axios.post(`${url}${ruta}`, {
                    idProductoHomologadoProducto: this.idProductoHomologadoProducto,
                    idProductoHomologadoRegistro: this.idProductoHomologadoRegistro,
                    producto: this.value.producto.trim(),
                    idUsuario: mainApp.idUsuario
                }).then(_ => {
                    alerts.success('Producto guardado');

                    this.getRegistros();

                    $('.cargando-c').hide();
                }).catch(err => validError(err));
            }
        },
        altaCertificados(item) {
            this.idProductoHomologadoRegistro = item.id_producto_homologado_registro;
            this.show.registros = false;
            this.show.productos = false;
            this.show.certificados = true;
            this.show.registro = false;

            setTimeout(_ => {
                this.$refs.certificacion.agregarArchivos(false);
            }, 5);
        },
        getCertificado(item) {
            this.idProductoHomologadoRegistro = item.id_producto_homologado_registro;
            this.idProductoHomologadoProducto = 0;
            this.show.registros = false;
            this.show.productos = false;
            this.show.certificados = true;
            this.show.registro = false;

            setTimeout(_ => {
                this.$refs.certificacion.getArchivo(item);
            }, 5);
        },
        certificadoElimina(item) {
            setTimeout(_ => {
                this.$refs.certificacion.eliminaArchivo(item);
            
            }, 5);
        },
        regresa() {
            this.idProductoHomologadoRegistro = 0;
            this.show.registros = true;
            this.show.productos = false;
            this.show.certificados = false;
            this.show.registro = false;
        },
        editarRegistro(item) {
            this.idProductoHomologadoRegistro = item.id_producto_homologado_registro;
            this.value.orden = item.orden ?? '';
            this.check.publicadoRegistro = item.publicado ?? false;

            this.show.registros = false;
            this.show.productos = false;
            this.show.certificados = false;
            this.show.registro = true;
        },
        guardarRegistro() {
            let msj = '';

            if (Number.isNaN(Number(this.value.orden.toString()))) {
                msj += '<li>El número de orden ingresado es inválido</li>';
            } else {
                if (Number(this.value.orden.toString()) < 0 || this.value.orden.toString() === '' || Number(this.value.orden.toString()) > 99.99) {
                    msj += '<li>El orden ingresado es inválido</li>'
                }
            }

            if (msj !== '') {
                alerts.error('Verifique lo siguiente', msj);
                return;
            }

            $('.cargando-c').show();
            axios.post(`${url}ProductosHomologados/RegistroActualiza`, {
                idProductoHomologadoRegistro: this.idProductoHomologadoRegistro,
                idUsuario: mainApp.idUsuario,
                orden: this.value.orden,
                publicado: this.check.publicadoRegistro
            }).then(_ => {
                $('.cargando-c').hide(); // Hide loading UI

                this.getRegistros(); // Fetch latest data

                // Hide the modal
                $(this.$refs.modalEmpresa).modal('hide');

                // Ensure the fade animation completes before showing the modal again
                $(this.$refs.modalEmpresa).on('hidden.bs.modal', () => {
                    $(this.$refs.modalEmpresa).off('hidden.bs.modal'); // Prevent duplicate bindings

                    // Wait until the modal is fully shown before showing the success message
                    $(this.$refs.modalEmpresa).on('shown.bs.modal', () => {
                        $(this.$refs.modalEmpresa).off('shown.bs.modal'); // Prevent duplicate bindings
                        alerts.success('Registro actualizado');
                    });

                    $(this.$refs.modalEmpresa).modal('show');
                    setTimeout(_ => {
                        alerts.success('Registro actualizado');
                    }, 500);
                });

            }).catch(err => validError(err));
        },
        vistaPrevia() {
            this.array.certificados = this.array.registros;//.filter(i => i.publicado);

            var nulos = this.array.registros.filter(i => i.productos.length == 0 && i.certificaciones.length === 0).map(i => i.id_producto_homologado_registro);
            this.array.certificados = this.array.registros
                .filter(i => !nulos.includes(i.id_producto_homologado_registro));
            $(this.$refs.modalVistaPrevia).modal('show');
        },
        /**
        * 
        * SORTED FUNCTIONS
        * 
        */
        eligeFiltro(opcion, asc = true) {

            for (const i in this.sorted) {
                this.sorted[i].asc = false;
                this.sorted[i].iconoAsc = this.iconoAsc;
                this.sorted[i].iconoDesc = this.iconoDesc;
            }

            switch (opcion) {
                case 1:
                    if (asc) {
                        this.sorted.nombre.asc = true;
                        this.sorted.nombre.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.nombre.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
                case 2:
                    if (asc) {
                        this.sorted.url.asc = true;
                        this.sorted.url.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.url.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
                case 3:
                    if (asc) {
                        this.sorted.publicado.asc = true;
                        this.sorted.publicado.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.publicado.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
            }
        },
        sortDocumentos(opcion) {
            switch (opcion) {
                case 1:
                    if (this.sorted.nombre.asc) {
                        this.array.empresas = sortObjectsByString(this.array.empresas, 'nombre');
                    } else {
                        this.array.empresas = sortObjectsByString(this.array.empresas, 'nombre', false);
                    }
                    break;
                case 2:
                    if (this.sorted.url.asc) {
                        this.array.empresas = sortObjectsByString(this.array.empresas, 'url');
                    } else {
                        this.array.empresas = sortObjectsByString(this.array.empresas, 'url', false);
                    }
                    break;
                case 3:
                    if (this.sorted.publicado.asc) {
                        this.array.empresas = sortObjectByNumber(this.array.empresas, 'publicado');
                    } else {
                        this.array.empresas = sortObjectByNumber(this.array.empresas, 'publicado', false);
                    }
                    break;
            }
        }
    },
    created() {
        this.init();
    },
    mounted() {       
        this.getHomos();
    }
}).mount('#appProductosHomologados');

