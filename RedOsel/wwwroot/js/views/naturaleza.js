


Vue.createApp({
    data() {
        return {
            check: {
                aguaFiltro: false,
                solventeFiltro: false,
                agua: false,
                solvente: false
            },
            value: {
                descripcionFiltro: '',
                descripcion: '',
                orden: 0
            },
            icono: 'lnr lnr-chevron-down',
            array: {
                naturalezas: []
            },
            idNaturaleza: 0,
            tituloModal: '',
            //Variables filtro en tablas
            iconoAsc: 'bi bi-caret-up',
            iconoDesc: 'bi bi-caret-down',
            iconoAscFill: 'bi bi-caret-up-fill',
            iconoDescFill: 'bi bi-caret-down-fill',
            sorted: {
                id: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                },
                tipo: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                },
                familia: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                },
                orden: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                },
                estatus: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                }
            }        
        }
    },
    methods: {
        checkTipo(opcion, evt) {
            switch (opcion) {
                case 1:
                    this.check.aguaFiltro = evt.target.checked;
                    this.check.solventeFiltro = false;
                    break;
                case 2:
                    this.check.aguaFiltro = false;
                    this.check.solventeFiltro = evt.target.checked;
                    break;
                default:
                    this.check.aguaFiltro = false;
                    this.check.solventeFiltro = false;
                    break;
            }
        },
        abreAcordion() {
            this.limpiar();
            if (this.icono.indexOf('down') !== -1) {
                this.icono = 'lnr lnr-chevron-up';
            } else {
                this.icono = 'lnr lnr-chevron-down';
            }
        },
        limpiar(opcion = 0) {
            if (opcion === 0) {
                this.value.descripcionFiltro = '';
                this.check.aguaFiltro = false;
                this.check.solventeFiltro = false;
            } else {
                this.idNaturaleza = 0;
                this.value.descripcion = '';
                this.value.orden = 0;
                this.check.estatus = false;
                this.check.agua = false;
                this.check.solvente = false;
            }
        },
        agregarNaturaleza() {
            this.tituloModal = 'Nueva Familia';
            this.limpiar(1);
            $(this.$refs.modalNaturaleza).modal('show');
        },
        getNaturalezas() {
            this.array.naturalezas = [];
            $('.cargando-c').show();

            let idTipoNaturaleza = 0;
            if (this.check.aguaFiltro || this.check.solventeFiltro) {
                idTipoNaturaleza = this.check.aguaFiltro ? 1 : 2;
            }

            axios.post(url + 'Naturaleza/NaturalezaConsulta', {
                idTipoNaturaleza: idTipoNaturaleza,
                descripcion: this.value.descripcionFiltro.trim()
            }, {
                headers: {
                    'Authorization': 'bearer ' + sessionStorage.getItem('tokRedOsel')
                }
            }).then(res => {
                this.array.naturalezas = res.data;

                for (const i in this.sorted) {
                    this.sorted[i].asc = false;
                    this.sorted[i].iconoAsc = this.iconoAsc;
                    this.sorted[i].iconoDesc = this.iconoDesc;
                }

                $('.cargando-c').hide();
            }).catch(err => {
                validError(err)
            });
        },
        getNaturaleza(item) {
            $('.cargando-c').show();
            this.limpiar(1);

            axios.post(url + 'Naturaleza/NaturalezaRecupera', {
                idNaturaleza: item.id_naturaleza
            }, {
                headers: {
                    'Authorization': 'bearer ' + sessionStorage.getItem('tokRedOsel')
                }
            }).then(res => {
                let ds = res.data;
                
                this.tituloModal = 'Edición Familia';

                this.idNaturaleza = ds.id_naturaleza;
                this.check.estatus = ds.estatus;
                this.value.descripcion = ds.descripcion;
                this.value.orden = Number(ds.orden);

                if (ds.tipoNaturaleza === 1) {
                    this.check.agua = true;
                } else {
                    this.check.solvente = true;
                }

                $(this.$refs.modalNaturaleza).modal('show');

                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        guardar() {
            let msj = '';
            if (!this.check.agua && !this.check.solvente) {
                msj += '<li>Elija un tipo de naturaleza</li>';
            }
            if (this.value.descripcion.trim() === '') {
                msj += '<li>Ingrese la descripción</li>';
            }
            if (Number(this.value.orden) < 0) {
                msj += '<li>Ingrese un orden válido</li>';
            } else {
                if (Number.isNaN(Number(this.value.orden))) {
                    msj += '<li>El número para "Orden" es inválido</li>';
                }
            }

            if (msj === '') {
                let ruta = Number(this.idNaturaleza) === 0 ? 'Naturaleza/NaturalezaInserta' : 'Naturaleza/NaturalezaActualiza';

                var data = {
                    idNaturaleza: this.idNaturaleza,
                    tipoNaturaleza: this.check.agua ? 1 : 2,
                    descripcion: this.value.descripcion.trim(),
                    estatus: this.check.estatus,
                    orden: this.value.orden
                }

                $('.cargando-c').show();
                axios.post(url + ruta, data, {
                    headers: {
                        'Authorization': 'bearer ' + sessionStorage.getItem('tokRedOsel')
                    }
                }).then(res => {
                    if (Number(this.idNaturaleza) === 0) {
                        alerts.success('Naturaleza guardada');
                    } else {
                        alerts.success('Naturaleza actualizada');
                    }

                    $(this.$refs.modalNaturaleza).modal('hide');
                    $('.cargando-c').hide();
                    this.getNaturalezas();
                }).catch(err => validError(err));
            } else {
                alerts.error('Verifique lo siguiente', msj);
            }
        },
        async naturalezaElimina(item) {
            let res = await alerts.confirm(`¿Está seguro de eliminar la naturaleza <i><u>${item.descripcion}</i></u>?`);
            if (res) {
                $('.cargando-c').show();
                axios.post(url + 'Naturaleza/NaturalezaElimina', {
                    idNaturaleza: item.id_naturaleza
                }, {
                    headers: {
                        'Authorization': 'bearer ' + sessionStorage.getItem('tokRedOsel')
                    }
                }).then(res => {
                    alerts.success('Naturaleza eliminada');

                    $('.cargando-c').hide();
                    this.getNaturalezas();
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
                        this.sorted.id.asc = true;
                        this.sorted.id.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.id.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
                case 2:
                    if (asc) {
                        this.sorted.tipo.asc = true;
                        this.sorted.tipo.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.tipo.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
                case 3:
                    if (asc) {
                        this.sorted.familia.asc = true;
                        this.sorted.familia.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.familia.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
                case 4:
                    if (asc) {
                        this.sorted.orden.asc = true;
                        this.sorted.orden.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.orden.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
                case 5:
                    if (asc) {
                        this.sorted.estatus.asc = true;
                        this.sorted.estatus.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.estatus.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
            }
        },
        sortDocumentos(opcion) {
            switch (opcion) {
                case 1:
                    if (this.sorted.id.asc) {
                        this.array.naturalezas = sortObjectByNumber(this.array.naturalezas, 'id_naturaleza');
                    } else {
                        this.array.naturalezas = sortObjectByNumber(this.array.naturalezas, 'id_naturaleza', false);
                    }
                    break;
                case 2:
                    if (this.sorted.tipo.asc) {
                        this.array.naturalezas = sortObjectByNumber(this.array.naturalezas, 'tipoNaturaleza');
                    } else {
                        this.array.naturalezas = sortObjectByNumber(this.array.naturalezas, 'tipoNaturaleza');
                    }
                    break;
                case 3:
                    if (this.sorted.familia.asc) {
                        this.array.naturalezas = sortObjectsByString(this.array.naturalezas, 'descripcion');
                    } else {
                        this.array.naturalezas = sortObjectsByString(this.array.naturalezas, 'descripcion', false);
                    }
                    break;
                case 4:
                    if (this.sorted.orden.asc) {
                        this.array.naturalezas = sortObjectByNumber(this.array.naturalezas, 'orden');
                    } else {
                        this.array.naturalezas = sortObjectByNumber(this.array.naturalezas, 'orden', false);
                    }
                    break;
                case 5:
                    if (this.sorted.estatus.asc) {
                        this.array.naturalezas = sortObjectByNumber(this.array.naturalezas, 'estatus');
                    } else {
                        this.array.naturalezas = sortObjectByNumber(this.array.naturalezas, 'estatus', false);
                    }
                    break;
            }
        } 
    },
    mounted() {
        this.getNaturalezas();
    }
}).mount('#appNaturaleza')