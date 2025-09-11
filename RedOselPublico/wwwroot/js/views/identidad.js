

mainApp.getMenu().then(res => {
    mainApp.setBanner(75, 'mainBg', 'divBanner');
}).catch(err => {
    validError(err);
});