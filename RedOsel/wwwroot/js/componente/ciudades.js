


window.componenteCiudad = {
    template: '#compoCiudad',
    props: {
        estados: {
            type: Array,
            default: () => [],
            required: true
        },
        idCiudad: {
            type: Number,
            default: 0
        },
        nuevo: {
            type: Boolean,
            default: false
        },
        idEstado: {
            type: Number,
            default: 0
        }
    },
    watch: {
        idCiudad(newValue, oldValue) {
            if (Number(newValue) !== 0) {
                this.localIdCiudad = Number(newValue);
                this.getCiudad();
            } else {
                this.localIdCiudad = Number(oldValue);
                this.getCiudad();
            }
        },
        nuevo(newValue, oldValue) {
            if (newValue) {
                this.agregarCiudad();
            }
        }
    },
    data() {
        return {
            localIdCiudad: 0,
            tituloModal: '',
            ddl: {
                estado: '0'
            },
            value: {
                descripcion: ''
            },
            check: {
                estatus: false
            },  
        }
    },
    methods: {
        agregarCiudad() {
            this.tituloModal = 'Nueva Ciudad';

            this.value.descripcion = '';
            this.check.estatus = false;
            this.ddl.estado = '0';
            this.localIdCiudad = 0;

            if (Number(this.idEstado) !== 0) {
                this.ddl.estado = this.idEstado.toString();
            }
            $(this.$refs.modalCiudad).modal('show');
        },
        cierraModal() {
            this.$emit('cancelar');     
            $(this.$refs.modalCiudad).modal('hide');
        },
        getCiudad() {
            $('.cargando-c').show();
            this.value.descripcion = '';
            this.check.estatus = false;
            this.ddl.estado = '0';

            axios.post(url + 'Ciudades/CiudadesRecupera', {
                idCiudad: this.localIdCiudad 
            }, {
                headers: {
                    'Authorization': 'bearer ' + sessionStorage.getItem('tokRedOsel')
                }
            }).then(res => {
                let ds = res.data;

                this.localIdCiudad = ds.id_ciudad;
                this.tituloModal = "Edición Ciudad";
                this.value.descripcion = ds.ciudad;
                this.check.estatus = ds.estatus;
                this.ddl.estado = ds.id_estado.toString();
                $(this.$refs.modalCiudad).modal('show');


                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        guardar() {
            let msj = '';
            if (Number(this.ddl.estado) === 0) {
                msj += '<li>Elija el estado</li>';
            }
            if (this.value.descripcion.trim() === '') {
                msj += '<li>Ingrese la descripción de la ciudad</li>'
            }

            if (msj === '') {
                let ruta = Number(this.localIdCiudad) === 0 ? 'Ciudades/CiudadesInserta' : 'Ciudades/CiudadesActualiza';

                $('.cargando-c').show();
                axios.post(url + ruta, {
                    idCiudad: this.localIdCiudad,
                    idEstado: this.ddl.estado,
                    descripcion: this.value.descripcion.trim(),
                    estatus: this.check.estatus
                }, {
                    headers: {
                        'Authorization': 'bearer ' + sessionStorage.getItem('tokRedOsel')
                    }
                }).then(res => {
                    $(this.$refs.modalCiudad).modal('hide');
                    if (Number(this.localIdCiudad) === 0) {
                        alerts.success('Ciudad guardada');
                        this.$emit('nuevaCiudad', res.data);
                    } else {
                        alerts.success('Ciudad actualizada');
                    }
                    this.$emit('buscar');

                    $('.cargando-c').hide();
                }).catch(err => validError(err));
            } else {
                alerts.error('Verifique lo siguiente', msj);
            }
        }
    },
    mounted() {

    }
};

