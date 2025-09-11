

Vue.createApp({
    components: {
        Equipos: window.componenteArchivos,
    },
    data() {
        return {
            icono: 'lnr lnr-chevron-down',
            array: {
                marcas: []
            },
            value: {
                nombreFiltro: '',
                nombre: '',
                descripcion: '',
                orden: ''
            },
            check: {
                publicado: false
            },
            disabled: {
                equipos: true
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
            nombreArchivo: '',
            file: null,
            logo: '',
            hrefLogo: '',
            tituloModal: '',
            idEquipoMarca: 0,
            tipoMultimedia: {
                equipo: 9
            }
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
                this.value.orden = '';
                this.disabled.equipos = true;
                this.idEquipoMarca = 0;
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
        agregaArchivo() {
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
        agregaMarcaEquipo() {
            this.limpiar(1);
            this.tituloModal = 'Nueva Marca de Equipo';

            this.$refs.tabEquipos.classList.remove('active');
            setTimeout(_ => {
                document.getElementById('equipos').classList.remove(...['active', 'show']);
            }, 150);

            $(this.$refs.modalEmpresa).modal('show');
        },
        getMarcas() {
            $('.cargando-c').show();

            this.array.marcas = [];

            axios.post(url + 'MarcasEquipos/Consulta', {
                nombre: this.value.nombreFiltro.trim()
            }).then(res => {
                if (res.data.length > 0) {
                    this.array.marcas = res.data;
                }

                for (const i in this.sorted) {
                    this.sorted[i].asc = false;
                    this.sorted[i].iconoAsc = this.iconoAsc;
                    this.sorted[i].iconoDesc = this.iconoDesc;
                }

                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        getMarca(item) {
            $('.cargando-c').show();
            axios.post(url + 'MarcasEquipos/Recupera', {
                idEquipoMarca: item.id_equipo_marca,
                idTipoMultimedia: '9,'
            }).then(res => {
                let ds = res.data;
                this.limpiar(1);
                this.tituloModal = 'Edición Marca de Equipo';

                this.idEquipoMarca = ds.id_equipo_marca;
                this.value.nombre = ds.nombre;
                this.check.publicado = ds.publicado ?? false;

                this.logo = ds.logo;
                this.hrefLogo = url + ds.directorio + ds.logo;

                this.value.orden = ds.orden ?? 0;
                this.disabled.equipos = false;

                setTimeout(a => {
                    this.$refs.tabEquipos.click();
                }, 20)
                $(this.$refs.modalEmpresa).modal('show');

                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        async marcaElimina(item) {
            let res = await alerts.confirm(`¿Está seguro de eliminar la marca <i><u>${item.nombre}</i></u>?`);
            if (res) {
                $('.cargando-c').show();
                axios.post(url + 'MarcasEquipos/Elimina', {
                    idEquipoMarca: item.id_equipo_marca,
                    idUsuario: mainApp.idUsuario
                }).then(res => {

                    alerts.success('Marca eliminada');
                    $('.cargando-c').hide();
                    this.getMarcas();
                }).catch(err => validError(err));
            }
        },
        guardar() {
            let msj = '';

            if (this.value.nombre.trim() === '') {
                msj += '<li>Ingrese el nombre de la marca</li>';
            }   
            if (Number(this.value.orden) < 0) {
                msj += '<li>Ingrese un orden válido';
            } else {
                if (Number.isNaN(Number(this.value.orden))) {
                    msj = '<li>El valor de orden no es válido</li>';
                }
            }
            if (this.nombreArchivo.trim() === '' && Number(this.idEquipoMarca) === 0) {
                msj += '<li>Elija el logo</li>';
            }

            if (msj === '') {
                $('.cargando-c').show();

                var ds = new FormData();

                ds.append('idEquipoMarca', this.idEquipoMarca);
                ds.append('nombre', this.value.nombre.trim());
                ds.append('descripcion', this.value.descripcion.trim());
                ds.append('logo', this.file);
                ds.append('publicado', this.check.publicado);
                ds.append('idUsuario', mainApp.idUsuario)
                ds.append('orden', this.value.orden);

                let ruta = Number(this.idEquipoMarca) === 0 ? 'MarcasEquipos/Inserta' : 'MarcasEquipos/Actualiza';

                axios.post(url + ruta, ds).then(res => {
                    $('.cargando-c').hide();

                    if (Number(this.idEquipoMarca) === 0) {
                        alerts.success('Marca guardada');

                        this.idEquipoMarca = res.data;
                        this.disabled.equipos = false;

                        setTimeout(a => {
                            this.$refs.tabEquipos.click();
                        }, 20)
                    } else {
                        alerts.success('Marca actualizada');
                    }

                    this.getMarcas();
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
                        this.array.marcas = sortObjectsByString(this.array.marcas, 'nombre');
                    } else {
                        this.array.marcas = sortObjectsByString(this.array.marcas, 'nombre', false);
                    }
                    break;
                case 2:
                    if (this.sorted.url.asc) {
                        this.array.marcas = sortObjectByNumber(this.array.marcas, 'total_equipo');
                    } else {
                        this.array.marcas = sortObjectByNumber(this.array.marcas, 'total_equipo', false);
                    }
                    break;
                case 3:
                    if (this.sorted.publicado.asc) {
                        this.array.marcas = sortObjectByNumber(this.array.marcas, 'publicado');
                    } else {
                        this.array.marcas = sortObjectByNumber(this.array.marcas, 'publicado', false);
                    }
                    break;
            }
        }
    },
    mounted() {
        this.getMarcas();
    }
}).mount('#appEquipos');