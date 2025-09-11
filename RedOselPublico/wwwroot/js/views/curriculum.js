


mainApp.getMenu().then(res => {
    mainApp.setBanner(76, 'mainBg', 'divBanner');
}).catch(err => {
    validError(err);
});