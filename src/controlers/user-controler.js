module.exports = async (app) => {
    const User = app.get('User');
    app.use('/users', (req, res, next) => {
        // for the /users endpoint, we want to require authentication for the following methods
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
            if (!req.user) {
                res.status(401).send({error: 'Unauthorized', message: 'You must be logged in to perform this action'});
            }
        }
        next();
    });

      

    app.get('/users', async (req, res) => {
        let result = await User.readAll();
        res.json(result);
    }
    );
}


