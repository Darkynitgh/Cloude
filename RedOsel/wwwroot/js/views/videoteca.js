

Vue.createApp({
    components: {
        Archivos: window.componenteArchivos
    },
    data() {
        return {
            tipoMultimedia: {
                listaPrecio: 15
            },
            icono: 'lnr lnr-chevron-down',
            value: {
                tituloFiltro: '',
                titulo: '',
                url: ''
            },
            check: {
                publicado: false
            },
            array: {
                videos: []
            },
            tituloModal: '',
            idVideo: 0,
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
                titulo: {
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
                this.value.tituloFiltro = '';
            } else {
                this.value.titulo = '';
                this.value.url = '';
                this.check.publicado = false;
                this.idVideo = 0;

                var a = document.getElementById('imagen');
                a.classList.remove(...['active', 'show']);
                this.$refs.btnImagen.classList.remove('active');
                this.$refs.btnImagen.disabled = true;
            }
        },
        agregarVideo() {
            this.tituloModal = 'Nuevo Vídeo';
            this.limpiar(1);
            $(this.$refs.modalVideo).modal('show');
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
        guardar() {
            let msj = '';

            if (this.value.titulo.trim() === '') {
                msj += '<li>Ingrese el titulo del vídeo</li>';
            }
            if (this.value.url.trim() === '') {
                msj += '<li>Ingrese la URL del vídeo</li>';
            } else {
                if (!this.isUrlValid(this.value.url.trim())) {
                    msj += '<li>El formato de la URL es inválido</li>';
                }
            }

            if (msj === '') {
                $('.cargando-c').show();

                let ruta = Number(this.idVideo) === 0 ? 'Videoteca/VideoInserta' : 'Videoteca/VideoActualiza';

                axios.post(url + ruta, {
                    idVideo: this.idVideo,
                    titulo: this.value.titulo.trim(),
                    urlVideo: this.value.url.trim(),
                    publicar: this.check.publicado
                }).then(res => {
                    let ds = res.data;

                    if (Number(this.idVideo) === 0) {                  
                        alerts.success('Vídeo guardado');
                        this.getVideos(true);
                    } else {
                        alerts.success('Vídeo actualizado');
                    }

                    $('.cargando-c').hide();

           
                }).catch(err => validError(err));
            } else {
                alerts.error('Verifique lo siguiente', msj);
            }
        },
        getVideos(retrieve = false) {
            $('.cargando-c').show();
            this.array.videos = [];

            axios.post(url + 'Videoteca/VideoConsulta', {
                descripcion: this.value.tituloFiltro.trim()
            }).then(res => {
                if (res.length !== '') {
                    this.array.videos = res.data;
                }

                for (const i in this.sorted) {
                    this.sorted[i].asc = false;
                    this.sorted[i].iconoAsc = this.iconoAsc;
                    this.sorted[i].iconoDesc = this.iconoDesc;
                }

                if (retrieve) {
                    let maxId = Math.max(...this.array.videos.map(video => video.id_videoteca));
                    this.getVideo({
                        id_videoteca: maxId
                    })
                }

                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        getVideo(item) {
            $('.cargando-c').show();

            axios.post(url + 'Videoteca/VideoRecupera', {
                idVideo: item.id_videoteca
            }).then(res => {
                this.tituloModal = 'Edición Vídeo';
                this.limpiar(1);

                this.value.titulo = res.data.titulo;
                this.value.url = res.data.url_video;
                this.check.publicado = res.data.publicar;
                this.idVideo = res.data.id_videoteca;
                this.$refs.btnImagen.disabled = false;
                this.$refs.btnImagen.click();
                $(this.$refs.modalVideo).modal('show');

                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        async videoElimina(item) {
            let res = await alerts.confirm(`¿Está seguro de elimina el vídeo <i><u>${item.titulo}</u></i>?`)
            if (res) {
                $('.cargando-c').show();

                axios.post(url + 'Videoteca/VideoElimina', {
                    idVideo: item.id_videoteca
                }).then(res => {
                    alerts.success('Vídeo eliminado');
                    
                    $('.cargando-c').hide();

                    this.getVideos();
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
                        this.sorted.titulo.asc = true;
                        this.sorted.titulo.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.titulo.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
                case 3:
                    if (asc) {
                        this.sorted.url.asc = true;
                        this.sorted.url.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.url.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
                case 4:
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
                    if (this.sorted.id.asc) {
                        this.array.videos = sortObjectByNumber(this.array.videos, 'id_videoteca');
                    } else {
                        this.array.videos = sortObjectByNumber(this.array.videos, 'id_videoteca', false);
                    }
                    break;
                case 2:
                    if (this.sorted.titulo.asc) {
                        this.array.videos = sortObjectsByString(this.array.videos, 'titulo');
                    } else {
                        this.array.videos = sortObjectsByString(this.array.videos, 'titulo', false);
                    }
                    break;
                case 3:
                    if (this.sorted.url.asc) {
                        this.array.videos = sortObjectsByString(this.array.videos, 'url_video');
                    } else {
                        this.array.videos = sortObjectsByString(this.array.videos, 'url_video', false);
                    }
                    break;
                case 4:
                    if (this.sorted.publicado.asc) {
                        this.array.videos = sortObjectByNumber(this.array.videos, 'publicar');
                    } else {
                        this.array.videos = sortObjectByNumber(this.array.videos, 'publicar', false);
                    }
                    break;
            }
        } 
    },
    mounted() {
        this.getVideos();
    }
}).mount('#appVideos')