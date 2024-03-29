/* istanbul ignore file */
const sequelize = require("sequelize");
const {
  formatSequelizeResponse,
  show_check,
  formatHTTPResponse,
} = require("../utils");

module.exports = async (app) => {
  class Data {
    // We create the model for the Data table in the database
    static database = app.get("db");

    static async get_item_timesheet(
      firstObjectType,
      firstFieldId,
      secondObjectType,
      month,
      year
    ) {

      let start = `${year}-${month.toString().padStart(2, "0")}-01 00:00:00`; // 1er janvier 2024 : 2024-01-01 00:00:00
      let end = `${year}-${month.toString().padStart(2, "0")}-${new Date(
        year,
        month,
        0
      ).getDate()} 23:59:59`; // 31 janvier 2024 : 2024-01-31 23:59:59

      if (firstObjectType === "user") {
        if (secondObjectType === "project") {
          return this.projects_of_user(firstFieldId, start, end);
        }
        return this.ressources_of_user(firstFieldId, start, end);
      }
      if (firstObjectType === "project") {
        if (secondObjectType === "user") {
          return this.users_of_project(firstFieldId, start, end);
        }
        return this.ressources_of_project(firstFieldId, start, end);
      }
      if (firstObjectType === "ressource") {
        if (secondObjectType === "user") {
          return this.users_of_ressource(firstFieldId, start, end);
        }
        return this.projects_of_ressource(firstFieldId, start, end);
      }
    }

    static async projects_of_user(user_id, start, end) {
      let query = `SELECT
            ajout_du_jour.project_name as row_label,
            SUM(ajout_du_jour.duree) as duration_in_hours,
            ajout_du_jour.jour_du_mois as day_of_month
        FROM
        
        (SELECT
            users.login as user_login,
            projects.name as project_name,
            ROUND(TIME_TO_SEC(TIMEDIFF(sessions.endTime, sessions.startTime))/3600, 2) as duree,
            DAY(sessions.startTime) AS jour_du_mois
        FROM
            users
        JOIN
            sessions ON users.login = sessions.userLogin
        JOIN
            projects ON sessions.projectId = projects.id
        WHERE
            users.login = '${user_id}'
                AND
            sessions.startTime
                    BETWEEN
                        '${start}'
                            AND
                        '${end}') as ajout_du_jour
        GROUP BY
            ajout_du_jour.user_login, ajout_du_jour.project_name, ajout_du_jour.jour_du_mois;`;

      let result = await this.database.query(query, {
        type: sequelize.QueryTypes.SELECT,
      });
      return result;
    }

    static async ressources_of_user(user_id, start, end) {
      let query = `SELECT
            ajout_du_jour.ressource_name as row_label,
            SUM(ajout_du_jour.duree) as duration_in_hours,
            ajout_du_jour.jour_du_mois as day_of_month
        FROM
        
        (SELECT
            users.login as user_login,
            ressources.name as ressource_name,
            ROUND(TIME_TO_SEC(TIMEDIFF(sessions.endTime, sessions.startTime))/3600, 2) as duree,
            DAY(sessions.startTime) AS jour_du_mois
        FROM
            users
        JOIN
            sessions ON users.login = sessions.userLogin
        JOIN
            utilisations ON utilisations.sessionId = sessions.id
        JOIN
            ressources ON utilisations.ressourceId = ressources.id
        WHERE
            users.login = '${user_id}'
                AND
            sessions.startTime
                    BETWEEN
                        '${start}'
                            AND
                        '${end}') as ajout_du_jour
        GROUP BY
            ajout_du_jour.user_login, ajout_du_jour.ressource_name, ajout_du_jour.jour_du_mois;`;

      let result = await this.database.query(query, {
        type: sequelize.QueryTypes.SELECT,
      });
      return result;
    }

    static async users_of_project(project_id, start, end) {
      let query = `SELECT
            ajout_du_jour.user_login as row_label,
            SUM(ajout_du_jour.duree) as duration_in_hours,
            ajout_du_jour.jour_du_mois as day_of_month
        FROM
        
        (SELECT
            users.login as user_login,
            projects.name as project_name,
            ROUND(TIME_TO_SEC(TIMEDIFF(sessions.endTime, sessions.startTime))/3600, 2) as duree,
            DAY(sessions.startTime) AS jour_du_mois
        FROM
            users
        JOIN
            sessions ON users.login = sessions.userLogin
        JOIN
            projects ON sessions.projectId = projects.id
        WHERE
            projects.id = '${project_id}'
                AND
            sessions.startTime
                    BETWEEN
                        '${start}'
                            AND
                        '${end}') as ajout_du_jour
        GROUP BY
            ajout_du_jour.user_login, ajout_du_jour.project_name, ajout_du_jour.jour_du_mois;`;

      let result = await this.database.query(query, {
        type: sequelize.QueryTypes.SELECT,
      });
      return result;
    }

    static async ressources_of_project(project_id, start, end) {
      let query = `SELECT
            ajout_du_jour.ressource_name as row_label,
            SUM(ajout_du_jour.duree) as duration_in_hours,
            ajout_du_jour.jour_du_mois as day_of_month
        FROM
        
        (SELECT
            projects.id as project_id,
            ressources.name as ressource_name,
            ROUND(TIME_TO_SEC(TIMEDIFF(sessions.endTime, sessions.startTime))/3600, 2) as duree,
            DAY(sessions.startTime) AS jour_du_mois
        FROM
            projects
        JOIN
            sessions ON projects.id = sessions.projectId
        JOIN
            utilisations ON utilisations.sessionId = sessions.id
        JOIN
            ressources ON utilisations.ressourceId = ressources.id
        WHERE
            projects.id = '${project_id}'
                AND
            sessions.startTime
                    BETWEEN
                        '${start}'
                            AND
                        '${end}') as ajout_du_jour
        GROUP BY
            ajout_du_jour.project_id, ajout_du_jour.ressource_name, ajout_du_jour.jour_du_mois;`;

      let result = await this.database.query(query, {
        type: sequelize.QueryTypes.SELECT,
      });
      return result;
    }

    static async users_of_ressource(ressource_id, start, end) {
      let query = `SELECT
        ajout_du_jour.user_login as row_label,
        SUM(ajout_du_jour.duree) as duration_in_hours,
        ajout_du_jour.jour_du_mois as day_of_month
    FROM
        (SELECT
            users.login as user_login,
            ressources.name as ressource_name,
            ROUND(TIME_TO_SEC(TIMEDIFF(sessions.endTime, sessions.startTime))/3600, 2) as duree,
            DAY(sessions.startTime) AS jour_du_mois
        FROM
            users
        JOIN
            sessions ON users.login = sessions.userLogin
        JOIN
            utilisations ON utilisations.sessionId = sessions.id
        JOIN
            ressources ON utilisations.ressourceId = ressources.id
        WHERE
            ressources.id = '${ressource_id}'
                AND
            sessions.startTime
                    BETWEEN
                        '${start}'
                            AND
                        '${end}') as ajout_du_jour
    GROUP BY
        ajout_du_jour.user_login, ajout_du_jour.ressource_name, ajout_du_jour.jour_du_mois;`;

      let result = await this.database.query(query, {
        type: sequelize.QueryTypes.SELECT,
      });
      return result;
    }

    static async projects_of_ressource(ressource_id, start, end) {
      let query = `SELECT
        ajout_du_jour.project_name as row_label,
        SUM(ajout_du_jour.duree) as duration_in_hours,
        ajout_du_jour.jour_du_mois as day_of_month
    FROM
    (SELECT
        projects.name as project_name,
        ressources.name as ressource_name,
        ROUND(TIME_TO_SEC(TIMEDIFF(sessions.endTime, sessions.startTime))/3600, 2) as duree,
        DAY(sessions.startTime) AS jour_du_mois
    FROM
        projects
    JOIN
        sessions ON projects.id = sessions.projectId
    JOIN
        utilisations ON utilisations.sessionId = sessions.id
    JOIN
        ressources ON utilisations.ressourceId = ressources.id
    WHERE
        ressources.id = '${ressource_id}'
            AND
        sessions.startTime
                BETWEEN
                    '${start}'
                        AND
                    '${end}') as ajout_du_jour
    GROUP BY
        ajout_du_jour.project_name, ajout_du_jour.ressource_name, ajout_du_jour.jour_du_mois;`;

      let result = await this.database.query(query, {
        type: sequelize.QueryTypes.SELECT,
      });
      return result;
    }
  }

  app.set("Data", Data);
};
