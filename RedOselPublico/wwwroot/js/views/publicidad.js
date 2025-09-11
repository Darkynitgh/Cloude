


mainApp.getMenu().then(res => {
    mainApp.setBanner(78, 'mainBg', 'divBanner');
}).catch(err => {
    validError(err);
});