

mainApp.getMenu().then(res => {
    mainApp.setBanner(77, 'mainBg', 'divBanner');
}).catch(err => {
    validError(err);
});