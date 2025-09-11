


Vue.createApp({
    data() {
        return {
            icono: 'lnr lnr-chevron-down',
            array: {
                empresas: []
            },
            value: {
                nombreFiltro: '',
                nombre: '',
                url: ''
            },
            check: {
                publicado: false
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
            idRs: 0,
            tituloModal: '',
            nombreArchivoMini: '',
            fileMini: null,
            nombreArchivo: '',
            file: null,
            logo: '',
            hrefLogo: '',
            logoMini: '',
            hrefLogoMini: ''
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
                this.idRs = 0;
                this.nombreArchivo = '';
                this.file = null;
                this.hrefLogo = '';
                this.nombreArchivoMini = '';
                this.fileMini = null;
                this.hrefLogoMini = '';

                this.value.nombre = '';
                this.value.url = '';
                this.check.publicado = false;
                tinymce.get('taDescripcion').setContent('');

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
        agregarOrganizacion() {
            this.limpiar(1);
            this.tituloModal = 'Nueva Organización';
            $(this.$refs.modalEmpresa).modal('show');
        },
        getOrganizaciones() {
            $('.cargando-c').show();

            this.array.empresas = [];

            axios.post(url + 'Rs/RsConsulta', {
                nombre: this.value.nombreFiltro.trim()
            }).then(res => {
                if (res.data.length > 0) {
                    this.array.empresas = res.data;
                }

                for (const i in this.sorted) {
                    this.sorted[i].asc = false;
                    this.sorted[i].iconoAsc = this.iconoAsc;
                    this.sorted[i].iconoDesc = this.iconoDesc;
                }

                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        getOrganizacion(item) {
            $('.cargando-c').show();
            axios.post(url + 'Rs/RsRecupera', {
                id: item.id_responsabilidad_social
            }).then(res => {
                let ds = res.data;
                this.limpiar(1);
                this.tituloModal = 'Edición Organización';

                this.idRs = ds.id_responsabilidad_social;
                this.value.nombre = ds.nombre;
                this.value.url = ds.url;
                tinymce.get('taDescripcion').setContent(ds.descripcion);
                this.check.publicado = ds.publicado ?? false;

                this.hrefLogo = url + ds.directorio + ds.logo;
                this.hrefLogoMini = url + ds.directorio + ds.logo_mini;

                this.logo = ds.logo;
                this.logoMini = ds.logo_mini;
                console.log(res);


                $(this.$refs.modalEmpresa).modal('show');

                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        async organizacionElimina(item) {
            let res = await alerts.confirm(`¿Está seguro de eliminar la organización <i><u>${item.nombre}</i></u>?`);
            if (res) {
                $('.cargando-c').show();
                axios.post(url + 'Rs/RsElimina', {
                    id: item.id_responsabilidad_social
                }).then(res => {

                    alerts.success('Organización eliminada');

                    this.getOrganizaciones();
                    $('.cargando-c').hide();
                }).catch(err => validError(err));
            }
        },
        isUrlValid(url, rtn = false) {
            try {
                if (url.trim() !== '') {
                    new URL(url);
                    return true;
                }
            } catch (e) {
                if (!rtn) {
                    alerts.error('URL inválida');
                }
                return false;
            }
        },
        init() {
            let initOpcions = {
                selector: '#taDescripcion',
                plugins: 'contextmenu print preview paste searchreplace autolink save directionality code visualblocks visualchars fullscreen link codesample table charmap hr pagebreak anchor toc insertdatetime advlist lists wordcount  textpattern help charmap emoticons importcss',
                menubar: 'file edit view insert format tools table help',
                toolbar: 'undo redo code | table | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview print | link anchor | ltr rtl',
                language: 'es_MX',
                importcss_append: true,
                content_css: ['/redosel/lib/bootstrap/dist/css/bootstrap.min.css'],
                height: 500,
                quickbars_selection_toolbar: 'bold italic | link blockquote',
                toolbar_mode: 'sliding',
                convert_urls: false,
                contextmenu: 'bold italic underline | link table',
            }

            tinymce.init(initOpcions);
        },
        guardar() {
            let msj = '';

            if (this.value.nombre.trim() === '') {
                msj += '<li>Ingrese el nombre de la organización</li>';
            }
            //if (this.value.url.trim() === '') {
            //    msj += '<li>Ingrese la URL</li>';
            //}
            if (this.nombreArchivoMini.trim() === '' && Number(this.idRs) === 0) {
                msj += '<li>Elija un logo mini</li>';
            }
            if (this.nombreArchivo.trim() === '' && Number(this.idRs) === 0) {
                msj += '<li>Elija el logo</li>';
            }
            if (tinymce.get('taDescripcion').getContent() === '') {
                msj += '<li>Ingrese la descripción</li>';
            }

            if (msj === '') {
                $('.cargando-c').show();

                var ds = new FormData();

                ds.append('id', this.idRs);
                ds.append('log', this.logo.trim());
                ds.append('logMini', this.logoMini.trim());
                ds.append('nombre', this.value.nombre.trim());
                ds.append('descripcion', tinymce.get('taDescripcion').getContent());
                ds.append('url', this.value.url.trim());
                ds.append('logo', this.file);
                ds.append('logoMini', this.fileMini);
                ds.append('publicado', this.check.publicado);

                let ruta = Number(this.idRs) === 0 ? 'Rs/RsInserta' : 'Rs/RsActualiza';

                axios.post(url + ruta, ds).then(res => {
                    $('.cargando-c').hide();
                    $(this.$refs.modalEmpresa).modal('hide');

                    if (Number(this.idRs) === 0) {
                        alerts.success('Organización guardada');
                    } else {
                        alerts.success('Organización actualizada');
                    }

                    this.getOrganizaciones();
                }).catch(err => validError(err));
            } else {
                alerts.error('Verifique lo siguiente', msj);
            }
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
    mounted() {
        this.getOrganizaciones();
        this.init();
    }
}).mount('#appResponsabilidadSocial');

