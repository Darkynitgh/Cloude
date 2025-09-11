
Vue.createApp({
    data() {
        return {};
    },
    methods: {
        urlImage(item) {
            return `${url}imagenes/manuales/${item.banner_pagina}`;
        },
        urlContent(item) {
            return `${url}${item.url_destino}`;
        },
        target(item) {
            return item.id_opcion !== 113 ? '_self' : '_blank';
        }
    },
    computed: {
        menu() {
            return mainApp.array?.recursos?.filter((item) => item.id === 91)?.[0]?.esferas;
        }
    },
    mounted() {
        mainApp.getMenu().then(res => {
            mainApp.setBanner(91, 'mainBg', 'divBanner');
        }).catch(err => {
            validError(err);
        });

    }
}).mount('#appHomologaciones');

