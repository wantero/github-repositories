class Contributors {

    constructor(
        repoId, id, node_id, login, avatar_url, html_url, contributions
    ) {
        this.repoId = repoId;
        this.id = id;
        this.node_id = node_id;
        this.login = login;
        this.avatar_url = avatar_url;
        this.html_url = html_url;
        this.contributions = contributions;        
    }
}

module.exports = Contributors;