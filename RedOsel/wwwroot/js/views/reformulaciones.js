

Vue.createApp({
    components: {
        Archivos: window.componenteArchivos
    },
    data() {
        return {
            icono: 'lnr lnr-chevron-down',
            idReformulacion: 0,
            array: {
                formulas: []
            },
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
                descripcion: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                },
                publicado: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                },
                fecha: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                }
            },
            /////
            tituloModal: '',
            tipoMultimedia: {
                listaPrecio: 13
            },
            value: {
                nombreFiltro: '',
                nombre: '',
                descripcion: '',
                fecha: '',
                orden: ''
            },
            check: {
                publicado: false
            },
            disabled: {
                listas: true
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
                this.idReformulacion = 0;
                this.value.nombre = '';
                this.value.descripcion = '';
                this.value.fecha = '';
                this.check.publicado = false;

                this.disabled.listas = true;
                this.$refs.btnListas.classList.remove('active');
                document.getElementById('listaPrecio').classList.remove(...['active', 'show']);
            }
        },
        agregarReformulacion() {
            this.tituloModal = 'Nueva Reformulacion'
            this.limpiar(1);
            $(this.$refs.modalListaPrecios).modal('show');
        },
        guardar() {
            let msj = '';
            if (this.value.nombre.trim() === '') {
                msj += '<li>Ingrese el nombre</li>';
            }
            if (this.value.descripcion.trim() === '') {
                msj += '<li>Ingrese la descripción</li>';
            }
            if (Number(this.value.orden) < 0) {
                msj += '<li>Ingrese un orden válido';
            } else {
                if (Number.isNaN(Number(this.value.orden))) {
                    msj = '<li>El valor de orden no es válido</li>';
                }
            }
            if (this.value.fecha.trim() === '') {
                msj += '<li>Ingrese la fecha</li>';
            }

            if (msj === '') {
                $('.cargando-c').show();

                let ruta = Number(this.idReformulacion) === 0 ? 'Reformulacion/Inserta' : 'Reformulacion/Actualiza';

                axios.post(url + ruta, {
                    idReformulacion: this.idReformulacion,
                    nombre: this.value.nombre.trim(),
                    descripcion: this.value.descripcion.trim(),
                    publicado: this.check.publicado,
                    fechaActualizacion: this.value.fecha,
                    idUsuario: mainApp.idUsuario,
                    orden: this.value.orden
                }).then(res => {
                    if (Number(this.idReformulacion) === 0) {
                        alerts.success('Reformulación guardada');
                        this.idReformulacion = res.data;
                        this.disabled.listas = false;
                        setTimeout(a => {
                            this.$refs.btnListas.click();
                        }, 0)
                    } else {
                        alerts.success('Reformulación actualizada');
                    }

                    this.getReformulaciones();
                    $('.cargando-c').hide();
                }).catch(err => validError(err));
            } else {
                alerts.error('Verifique lo siguiente', msj);
            }
        },
        getReformulaciones() {
            $('.cargando-c').show();
            axios.post(url + 'Reformulacion/Consulta', {
                nombre: this.value.nombreFiltro.trim()
            }).then(res => {
                this.array.formulas = res.data;

                for (const i in this.sorted) {
                    this.sorted[i].asc = false;
                    this.sorted[i].iconoAsc = this.iconoAsc;
                    this.sorted[i].iconoDesc = this.iconoDesc;
                }

                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        getReformulacion(item) {
            $('.cargando-c').show();
            axios.post(url + 'Reformulacion/Recupera', {
                idReformulacion: item.id_reformulacion
            }).then(res => {
                this.tituloModal = 'Edición de Reformulación'
                this.limpiar(1);

                let ds = res.data;

                this.idReformulacion = ds.id_reformulacion;
                this.value.nombre = ds.nombre;
                this.value.descripcion = ds.descripcion;
                this.check.publicado = ds.publicado;
                this.value.fecha = this.getDate(ds.fecha_actualizacion);

                this.disabled.listas = false;
                setTimeout(a => {
                    this.$refs.btnListas.click();
                }, 0)

                this.value.orden = ds.orden ?? 0;

                $(this.$refs.modalListaPrecios).modal('show');
                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        getDate(inputDate) {
            return luxon.DateTime.fromISO(inputDate).toFormat("dd/MM/yyyy");
        },
        async reformulacionElimina(item) {
            let res = await alerts.confirm(`¿Está seguro de eliminar <i><u>${item.nombre}</u></i>?`);
            if (res) {
                $('.cargando-c').show();
                axios.post(url + 'Reformulacion/Elimina', {
                    idReformulacion: item.id_reformulacion,
                    idUsuario: mainApp.idUsuario
                }).then(res => {
                    alerts.success('Reformulación eliminada');

                    this.getReformulaciones();
                    $('.cargando-c').hide();
                }).catch(err => validError(err));
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
                        this.sorted.descripcion.asc = true;
                        this.sorted.descripcion.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.descripcion.iconoDesc = this.iconoDescFill;
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
                        this.array.formulas = sortObjectsByString(this.array.formulas, 'nombre');
                    } else {
                        this.array.formulas = sortObjectsByString(this.array.formulas, 'nombre', false);
                    }
                    break;
                case 2:
                    if (this.sorted.descripcion.asc) {
                        this.array.formulas = sortObjectsByString(this.array.formulas, 'descripcion');
                    } else {
                        this.array.formulas = sortObjectsByString(this.array.formulas, 'descripcion', false);
                    }
                    break;
                case 3:
                    if (this.sorted.publicado.asc) {
                        this.array.formulas = sortObjectByNumber(this.array.formulas, 'publicado');
                    } else {
                        this.array.formulas = sortObjectByNumber(this.array.formulas, 'publicado', false);
                    }
                    break;
            }
        }
    },
    mounted() {
        this.getReformulaciones();
    }
}).mount('#appReformulacion');


