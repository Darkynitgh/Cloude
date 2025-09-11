



Vue.createApp({
    data() {
        return {
            array: {
                galeriaObrasMini: [],
                imagenesObra: []
            },
            obraActual: 'N/D'
        }
    },
    methods: {
        getGaleriaObras() {
            setLoader();
            this.array.videos = [];

            axios.post(`${url}RedOsel/GaleriaDeObraConsulta`, {
                descripcion: '',
                publicado: 1
            }).then(res => {

                if (res.data.length > 0) {
                    let chunks = 5;
                    if (window.screen.width >= 768 && window.screen.width <= 1110) {
                        chunks = 4;
                    }
                    if (window.screen.width < 768) {
                        chunks = 2;
                    }


                    this.array.galeriaObrasMini = res?.data?.map(i => {
                        return {
                            ...i,
                            multimedia: i?.multimedia?.map(j => {
                                return {
                                    ...j,
                                    src: document.location.origin + '/RedOsel/archivos/multimedia/' + j?.id_tipo_multimedia + '/' + j?.archivo + '?v=' + this.generateRandomNineDigitNumber(),
                                    alt: document.location.origin + '/RedOsel/archivos/multimedia/' + j?.id_tipo_multimedia + '/' + j?.archivo + '?v=' + this.generateRandomNineDigitNumber()
                                }
                            }).filter(k => k.id_tipo_multimedia === 6),
                            multimediaObra: i?.multimedia?.map(j => {
                                return {
                                    ...j,
                                    src: document.location.origin + '/RedOsel/archivos/multimedia/' + j?.id_tipo_multimedia + '/' + j?.archivo + '?v=' + this.generateRandomNineDigitNumber(),
                                    alt: document.location.origin + '/RedOsel/archivos/multimedia/' + j?.id_tipo_multimedia + '/' + j?.archivo + '?v=' + this.generateRandomNineDigitNumber()
                                }
                            }).filter(k => k.id_tipo_multimedia === 7).sort((a, b) => {
                                return b.orden - a.orden;
                            })
                        }
                    })


                    this.array.galeriaObrasMini = this.array.galeriaObrasMini.map(i => {
                        return {
                            ...i,
                            src: i.multimedia[0]?.src,
                            alt: i.multimedia[0]?.alt
                        }
                    })

                    this.array.galeriaObrasMini = this.chunkArray(this.array.galeriaObrasMini, chunks);

                    if (this.array.galeriaObrasMini.length > 0) {
                        var i = this.array.galeriaObrasMini[0][0];
                        this.obraActual = i.descripcion;
                        this.array.imagenesObra = i.multimediaObra;
                    };


                    setTimeout(_ => {
                        new bootstrap.Carousel(document.getElementById('carouselExampleCaptions'), {
                            interval: 5000,   // Time between slides (in milliseconds)
                            keyboard: true,    // Enable keyboard controls
                            pause: "hover",    // Pause on mouse hover
                            ride: "carousel",  // Auto-start carousel
                            touch: true,       // Enable swipe gestures
                            wrap: false         // Loop back to first slide
                        });
                    }, 250);
                }
                

                setLoader('hide');
            }).catch(err => validError(err));
        },
        generateRandomNineDigitNumber() {
            return Math.floor(100000000 + Math.random() * 900000000);
        },
        chunkArray(array, chunkSize) {
            const newArray = [];
            for (let i = 0; i < array.length; i += chunkSize) {
                // Extract a chunk of size `chunkSize` and push it to the new array
                newArray.push(array.slice(i, i + chunkSize));
            }
            return newArray;
        },
        verObra(i) {
            setLoader();
            this.obraActual = i.descripcion;
            this.array.imagenesObra = [];
            this.array.imagenesObra = i.multimediaObra.map(i => {
                return {
                    ...i,
                    src: document.location.origin + '/RedOsel/archivos/multimedia/' + i.id_tipo_multimedia + '/' + i.archivo + '?v=' + this.generateRandomNineDigitNumber(),
                    alt: document.location.origin + '/RedOsel/archivos/multimedia/' + i.id_tipo_multimedia + '/' + i.archivo + '?v=' + this.generateRandomNineDigitNumber()
                }
            });

            setTimeout(_ => {
                setLoader('hide');
            }, 500)
        }
    },
    mounted() {
        mainApp.getMenu().then(res => {
            mainApp.setBanner(57, 'mainBg', 'divBanner');
            this.getGaleriaObras();

            window.onresize = () => {
                if (window.screen.width > 768) {
                    this.getGaleriaObras();
                }
                
            }
        }).catch(err => {
            validError(err);
        });
        
    }
}).mount('#appGaleriaDeObras')



carousel = true;