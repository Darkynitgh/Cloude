

Vue.createApp({
    components: {
        Archivos: window.componenteArchivos,
    },
    data() {
        return {
            array: {
                archivos: []
            },
            tipoMultimedia: {
                archivo: 0
            },
            tituloModal: '',
            idMultimedia: 0,
            //Variables filtro en tablas
            iconoAsc: 'bi bi-caret-up',
            iconoDesc: 'bi bi-caret-down',
            iconoAscFill: 'bi bi-caret-up-fill',
            iconoDescFill: 'bi bi-caret-down-fill',
            sorted: {
                titulo: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                },
                orden: {
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
            ////////
            disabled: {
                agregar: true
            }
        }
    },
    methods: {
        agregar() {
            this.tituloModal = 'Agregar'
            this.$refs.archivo.agregarArchivos();
            $(this.$refs.modalArchivo).modal('show');
        },
        abreModal() {
            $(this.$refs.modalArchivo).modal('show');
        },
        cerrarModal() {
            $(this.$refs.modalArchivo).modal('hide');
        },
        activa() {
            this.disabled.agregar = false;
        },
        getDate(inputDate) {
            return luxon.DateTime.fromISO(inputDate).toFormat("dd/MM/yyyy");
        },
        getArchivos() {
            $(this.$refs.modalArchivo).modal('hide');
            axios.post(url + 'Archivos/MultimediaConsulta', {
                idOrigen: 0,
                idTipoMultimedia: this.tipoMultimedia.archivo
            }).then(res => {
                let ds = res.data;

                let ruta = ds.ruta;

                let array = ds.archivos ?? '';
                array = array === '' ? [] : array;

                if (array.length > 0) {
                    array = JSON.parse(array).map(i => {
                        return {
                            ...i,
                            ruta: url + ruta + i.archivo
                        }
                    });
                }

                for (const i in this.sorted) {
                    this.sorted[i].asc = false;
                    this.sorted[i].iconoAsc = this.iconoAsc;
                    this.sorted[i].iconoDesc = this.iconoDesc;
                }

                this.array.archivos = array;
            }).catch(err => validError(err));
        },
        getArchivo(item) {
            this.$refs.archivo.getArchivo(item);
        },
        elimina(item) {
            this.$refs.archivo.eliminaArchivo(item);
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
                        this.sorted.titulo.asc = true;
                        this.sorted.titulo.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.titulo.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
                case 2:
                    if (asc) {
                        this.sorted.orden.asc = true;
                        this.sorted.orden.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.orden.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
                case 3:
                    if (asc) {
                        this.sorted.fecha.asc = true;
                        this.sorted.fecha.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.fecha.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
            }
        },
        sortDocumentos(opcion) {
            switch (opcion) {
                case 1:
                    if (this.sorted.titulo.asc) {
                        this.array.archivos = sortObjectsByString(this.array.archivos, 'titulo');
                    } else {
                        this.array.archivos = sortObjectsByString(this.array.archivos, 'titulo', false);
                    }
                    break;
                case 2:
                    if (this.sorted.orden.asc) {
                        this.array.archivos = sortObjectByNumber(this.array.archivos, 'orden', true, true, 1, '-');
                    } else {
                        this.array.archivos = sortObjectByNumber(this.array.archivos, 'orden', false, true, 1, '-');
                    }
                    break;
                case 3:
                    if (this.sorted.fecha.asc) {
                        this.array.archivos = sortOBjectByDate(this.array.archivos, 'fecha_alta', true, 0, true);
                    } else {
                        this.array.archivos = sortOBjectByDate(this.array.archivos, 'fecha_alta', false, 0, true);
                    }
                    break;
            }
        } 
    },
    created() {
    },
    mounted() {
        this.tipoMultimedia.archivo = Number(this.$refs.hdnTipo.value.trim());
        this.getArchivos();
    }
}).mount('#appGaleriaArmoniza')