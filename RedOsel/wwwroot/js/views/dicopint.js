

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
                descripcion: ''
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
            idDicopint: 0,
            fileMini: null,
            nombreArchivo: '',
            file: null,
            logo: '',
            hrefLogo: '',
            tituloModal: ''
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
                this.idDicopint = 0;
                this.nombreArchivo = '';
                this.file = null;
                this.hrefLogo = '';

                this.value.nombre = '';
                this.value.descripcion = '';
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

            this.file = null;
            this.nombreArchivo = '';

            fileInput.onchange = (evt) => {
                if (evt.target.files.length > 0) {
                    this.nombreArchivo = evt.target.files[0].name;
                    this.file = evt.target.files[0];
                }
            };

            fileInput.click();
        },
        agregaDicopint() {
            this.limpiar(1);
            this.tituloModal = 'Nueva Empresa';
            $(this.$refs.modalEmpresa).modal('show');
        },
        getDicopints() {
            $('.cargando-c').show();

            this.array.empresas = [];

            axios.post(url + 'Dicopint/Consulta', {
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
        getDicopint(item) {
            $('.cargando-c').show();
            axios.post(url + 'Dicopint/Recupera', {
                idDicopint: item.id_dicopint
            }).then(res => {
                let ds = res.data;
                this.limpiar(1);
                this.tituloModal = 'Edición Empresa';

                this.idDicopint = ds.id_dicopint;
                this.value.nombre = ds.nombre;
                this.value.descripcion = ds.descripcion;
                this.check.publicado = ds.publicado ?? false;

                this.logo = ds.logo;
                this.hrefLogo = url + ds.directorio + ds.logo;
                $(this.$refs.modalEmpresa).modal('show');

                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        async dicopintElimina(item) {
            let res = await alerts.confirm(`¿Está seguro de eliminar la empresa de Dicopint <i><u>${item.nombre}</i></u>?`);
            if (res) {
                $('.cargando-c').show();
                axios.post(url + 'Dicopint/Elimina', {
                    idDicopint: item.id_dicopint
                }).then(res => {

                    alerts.success('Empresa eliminada');
                    $('.cargando-c').hide();
                    this.getDicopints();
                }).catch(err => validError(err));
            }
        },
        guardar() {
            let msj = '';

            if (this.value.nombre.trim() === '') {
                msj += '<li>Ingrese el nombre de la organización</li>';
            }
            if (this.value.descripcion.trim() === '') {
                msj += '<li>Ingrese la descripción</li>';
            }
            if (this.nombreArchivo.trim() === '' && Number(this.idRs) === 0) {
                msj += '<li>Elija el logo</li>';
            }

            if (msj === '') {
                $('.cargando-c').show();

                var ds = new FormData();

                ds.append('idDicopint', this.idDicopint);
                ds.append('nombre', this.value.nombre.trim());
                ds.append('descripcion', this.value.descripcion.trim());
                ds.append('logo', this.file);
                ds.append('publicado', this.check.publicado);

                let ruta = Number(this.idDicopint) === 0 ? 'Dicopint/Inserta' : 'Dicopint/Actualiza';

                axios.post(url + ruta, ds).then(res => {
                    $('.cargando-c').hide();
                    $(this.$refs.modalEmpresa).modal('hide');

                    if (Number(this.idDicopint) === 0) {
                        alerts.success('Empresa guardada');
                    } else {
                        alerts.success('Empresa actualizada');
                    }

                    this.getDicopints();
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
                        this.array.empresas = sortObjectsByString(this.array.empresas, 'descripcion');
                    } else {
                        this.array.empresas = sortObjectsByString(this.array.empresas, 'descripcion', false);
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
        this.getDicopints();
    }
}).mount('#appDicopint');