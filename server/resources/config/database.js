// database.js (config) (server)
// Contain database informations

module.exports = {
	path: __dirname + "\\..\\..\\data\\database\\CodeDB.db",
	tables: {
		project: {
			name: "project",
			fields: {
				id: "ProjectID",
				name: "Name",
				isFolder: "CreationDate",
				isDeleted: "DeletionDate",
				creationDate: "CreationUserId",
				deletionUserId: "DeletionUserId",
				deletionDate: "Description"				
			}
		},
		file: {
			name: "file",
			fields: {
				id: "FileID",
				name: "Name",
				isFolder: "IsFolder",
				isDeleted: "IsDeleted",
				creationDate: "CreationDate",
				lastEditionDate: "LastEditionDate",
				deletionDate: "DeletionDate",
				parentFolderId: "ParentFolderId",
				projectId: "ProjectId",
				creationUserId: "CreationUserId",
				editionUserId: "EditionUserId",
				deletionUserId: "DeletionUserId"				
			}
		},
		relUserProject: {
			name: "rel_user_project",
			fields: {
				userId: "UserID",
				projectId: "ProjectID",
				permissionLevel: "PermissionLevel",
				userColor: "UserColor"
			}
		},
		user: {
			name: "user",
			fields: {
				userId: "UserID",
				username: "Username",
				pass: "Password",
				avatarURL: "AvatarURL",
				inscriptionDate: "InscriptionDate",
				lastConnection: "LastConnection"
			}
		}
	}
}