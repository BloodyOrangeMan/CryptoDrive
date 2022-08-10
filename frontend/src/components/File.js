import { useState } from 'react';
import { useHistory } from 'react-router';


import { TextField } from '@material-ui/core';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import CreateIcon from '@mui/icons-material/Create';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import axios from 'axios';

require('dotenv').config()

const style = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 400,
	borderRadius: 5,
	bgcolor: 'background.paper',
	boxShadow: 24,
	p: 4,
};

const Main = ({ metaData, reRender, setReRender }) => {
	const [open, setOpen] = useState(false);
	const [newFileName, setNewFileName] = useState(metaData.filename);

	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	const history = useHistory();

	// HANDLE DELETE
	const handleDelete = () => {
		const filename = metaData.fileName;
		console.log(metaData);
		fetch(`/api/file/${filename}`, {
			method: 'DELETE',
			withCredentials: true,
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then((res) => {if (res.status === 200) {
				reRender ? setReRender(0) : setReRender(1);
			}})
			.catch((err) => console.log(err));
	};

	// HANDLE RENAME
	const handleRename = () => {
		const data = {
			filename: metaData.filename,
			metadata: {
				filename: newFileName,
				createdate: metaData.createdate,
				lastmodified: new Date(Date.now()).toDateString(),
				filesize: metaData.filesize,
				type: metaData.type,
			},
		};
		fetch(`${process.env.REACT_APP_IP}/renameBlob`, {
			method: 'PATCH',
			withCredentials: true,
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					handleClose();
					reRender ? setReRender(0) : setReRender(1);
				}
			})
			.catch((err) => console.log(err));
	};

	// HANDLE DOWNLOAD
	const handleDownload = () => {
		const filename = metaData.fileName;
		axios
        .get(
            `/api/file/${filename}`, {
                responseType: 'blob',
				withCredentials: true
            }
        )
        .then(response => {
			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', filename); //or any other extension
			document.body.appendChild(link);
			link.click();
        })
        .catch( (error) => {
            console.error("File could not be downloaded:", error);
        });
	};
	return (
		<div className="file">
			<div className="file-header">
				<InsertDriveFileIcon />
				<p className="file-name" title={metaData.fileName}>
					{metaData.fileName}
				</p>

				<IconButton onClick={handleDownload}>
					<DownloadIcon />
				</IconButton>
			</div>
			<div className="file-info">
				Created: {metaData.createDate} <br />
				Last Modified: {metaData.lastModified} <br />
				File Size: {metaData.fileSize} MB
				<br />
				<br />
			</div>

			<div className="file-footer">
				<IconButton onClick={handleDelete}>
					<DeleteIcon />
				</IconButton>
				<IconButton onClick={handleOpen}>
					<CreateIcon />
				</IconButton>
			</div>
			<Modal
				open={open}
				onClose={handleClose}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<Box sx={style}>
					<Typography id="modal-modal-title" variant="h6" component="h2">
						<TextField
							required
							id="outlined-full-width"
							label="File Name"
							margin="normal"
							variant="outlined"
							fullWidth
							style={{ margin: 8 }}
							InputLabelProps={{
								shrink: true,
							}}
							defaultValue={metaData.fileName}
							onChange={(e) => {
								setNewFileName(e.target.value);
							}}
						/>
					</Typography>

					{/* SAVE / EDIT / UPDATE REQUEST */}
					<Button
						style={{ margin: 8 }}
						variant="contained"
						onClick={handleRename}
					>
						Save
					</Button>
				</Box>
			</Modal>
		</div>
	);
};
export default Main;
