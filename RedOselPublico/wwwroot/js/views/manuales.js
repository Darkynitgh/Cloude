

let modalEquipos;

Vue.createApp({
    data() {
        return {
            show: {
                curriculum: false,
                precios: false,
                detalle: false,
            },
            array: {
                marcas: [],
                equipos: []
            },
            srcImagen: '',
            src: '',
            tituloModal: ''
        }
    },
    methods: {

        chooseEvent(item) {
            if (item.id_opcion === 111) {
                return this.mostrar(1);
            }
            if (item.id_opcion === 115) {
                return this.mostrar(2);
            }
        },
        urlImage(item) {
            return `${url}imagenes/manuales/${item.banner_pagina}`;
        },
        urlContent(item) {
            return `${url}${item.url_destino}`;
        },
        upper(desc) {
            return desc?.toUpperCase();
        },
        mostrar(opcion) {
            if (opcion === 1) {
                this.show.precios = false;
                this.show.curriculum = true;

                this.srcImagen = '../imagenes/manuales/manuales-cv.png';
                if (!this.show.detalle) {
                    this.mostrarDetalle(opcion);
                }

                setTimeout(_ => {
                    var a = document.getElementById('refFocus');
                    a.scrollIntoView();
                }, 50)
            }
            if (opcion === 2) {
                this.show.precios = true;
                this.show.curriculum = false;

                this.srcImagen = '../imagenes/manuales/manuales-equipos.png';
                if (!this.show.detalle) {
                    this.mostrarDetalle(opcion);
                }
                setTimeout(_ => {
                    var a = document.getElementById('refFocus');
                    a.scrollIntoView();
                }, 50)
            }           

        },
        mostrarDetalle(opcion) {
            if (!this.show.detalle) {
                this.show.detalle = true;
            } else {
                this.show.detalle = false;
            }          
        },
        getEquipos(marca) {
            setLoader();


            sessionStorage.setItem('idMarca', marca.id_equipo_marca);
            document.location.assign(`${url}RedOsel/Equipos`);

            //console.log(marca);
            //this.tituloModal = 'Marca ' + marca.nombre;
            //this.array.equipos = marca.equipos;
            //this.src = '';
            //modalEquipos.show();

            //setLoader('hide');
        },
        verImagen(item) {
            this.array.equipos.forEach(i => {
                i.over = false;
            });
            item.over = true;
            this.src = item.ruta;
        },
        getMarcas() {
            setLoader();
            axios.post(`${url}RedOsel/EquiposConsulta`, {
                descripcion: '',
                orden: 1,
                publicado: 1
            }).then(res => {
                if (res.data.length > 0) {
                    this.array.marcas = res.data?.map(i => {
                        let mult = [];
                        if (i.multimedia.length > 0) {
                            mult = i?.multimedia?.map(a => {
                                return {
                                    ...a,
                                    ruta: document.location.origin + '/admin/archivos/multimedia/' + a.id_tipo_multimedia + '/' + a.imagen,
                                    href: document.location.origin + '/admin/archivos/multimedia/' + a.id_tipo_multimedia + '/' + a.archivo
                                }
                            });
                        };

                        return {
                            ...i,
                            fecha: luxon.DateTime.fromISO(i.fecha_creacion).toFormat('dd-MMM-yyyy'),
                            equipos: mult,
                            logo: document.location.origin + '/admin/archivos/multimedia/marcas-equipos/' + i.logo
                        };

                        delete i.multimedia;
                    });
                }

                setLoader('hide')
            }).catch(err => validError(err))
        },
    },
    computed: {
        menu() {
            return mainApp.array?.recursos?.filter((item) => item.id === 90)?.[0]?.esferas;
        },
    },
    mounted() {
        mainApp.getMenu().then(res => {
            mainApp.setBanner(90, 'mainBg', 'divBanner');
            this.getMarcas();
            modalEquipos = new bootstrap.Modal(this.$refs.modalEquipos, {
                keyboard: false
            })
        }).catch(err => {
            validError(err);
        });
       
    }
}).mount('#appManuales');