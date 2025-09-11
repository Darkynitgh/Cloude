


mainApp.getMenu().then(res => {
    mainApp.setBanner(79, 'mainBg', 'divBanner');
}).catch(err => {
    validError(err);
});