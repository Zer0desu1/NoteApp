const { ipcRenderer } = require('electron');
const { createDatabaseConnection, postgresClient } = require('./db');
try {
  createDatabaseConnection();

} catch (error) {
  
}/*
document.getElementById('helloButton').addEventListener('click', () => {
  console.log('Hello');
});

document.getElementById('closeButton').addEventListener('click', () => {
  ipcRenderer.send('close-app');
});*/


//!-----------------------------------------------------------------------------------------------------------------------------------


document.getElementById('buton').addEventListener('click', async () => {
try {
 // const textarea = document.getElementById('myTextarea');
  //const textareaValue = textarea.value;

  const newTextarea = document.createElement('textarea');
  newTextarea.rows = '2';
  newTextarea.cols = '50';
  newTextarea.value = '';

  const newLabel = document.createElement('label');
  newLabel.textContent = 'Done';
  console.log('step1');
  const newCheckbox = document.createElement('input');
  newCheckbox.type = 'checkbox';
  const expiredLabel = document.createElement('label');
  expiredLabel.textContent = 'Expired';
  const expiredCB = document.createElement('input');
  expiredCB.type = 'checkbox';
  const delButton=document.createElement('button');
  console.log('step2');

  document.body.appendChild(newTextarea);
  document.body.appendChild(newLabel);
  document.body.appendChild(newCheckbox);
  document.body.appendChild(expiredLabel);
  document.body.appendChild(expiredCB);
  document.body.appendChild(delButton);
  delButton.textContent='delete';
  const result = await postgresClient.query('INSERT INTO todolist (description, done, expired) VALUES ($1, $2, $3) RETURNING todoid', ['', false, false]);
  const id = result.rows[0].todoid;
  console.log('Inserted row with ID:', id);
  
  console.log('step3');


  function updateBackgroundColor() {
    newTextarea.style.backgroundColor = newCheckbox.checked ? 'green' :
      (expiredCB.checked ? 'red' : 'white');
      
  }

  newCheckbox.addEventListener('change', async () => {
    if(newCheckbox.checked)
        expiredCB.checked=false;
    
    updateBackgroundColor();
    //ipcRenderer.send('checkbox', newCheckbox.checked, resultRows[i].todoid);

    await postgresClient.query('UPDATE todolist SET description=$1,done=$2,expired=$3 where todoid=$4', [newTextarea.value, newCheckbox.checked, expiredCB.checked,id]);


    
  });

  expiredCB.addEventListener('change', async () => {
    if(expiredCB.checked)
        newCheckbox.checked=false;
    updateBackgroundColor();
    //ipcRenderer.send('checkbox', expiredCB.checked, resultRows[i].todoid);

    // Update the database
    await postgresClient.query('UPDATE todolist SET description=$1,done=$2,expired=$3 where todoid=$4', [newTextarea.value, newCheckbox.checked, expiredCB.checked,id]);

  });



  newTextarea.addEventListener('input', async() => {
    const textContent = newTextarea.value;
    console.log(id,textContent);
    await postgresClient.query('UPDATE todolist SET description=$1,done=$2,expired=$3 where todoid=$4', [textContent, newCheckbox.checked, expiredCB.checked,id]);

  });

  delButton.addEventListener('click',async()=>{
    newTextarea.remove();
    newLabel.remove();
    newCheckbox.remove();
    expiredLabel.remove();
    expiredCB.remove();
    delButton.remove();
    await postgresClient.query('DELETE  FROM todolist WHERE todoid=$1',[id]);

  });

} catch (error) {
  console.log(error);
}
});

//!-----------------------------------------------------------------------------------------------------------------------------------------------------------------------



document.getElementById('exit').addEventListener('click', async() => {//save and close
  ipcRenderer.send('add');
  const result = await postgresClient.query('SELECT * FROM todolist ORDER BY todoid ASC');
  const resultRow=result.rows;
  for(let i=0;i<resultRow.length;i++){
    console.log(resultRow[i]);

  }
});




ipcRenderer.on('awake', (event, resultRows) => {
  console.log('Received data in renderer process:', resultRows);

  // Check if the received data is an array
  if (Array.isArray(resultRows)) {
    for (let i = 0; i < resultRows.length; i++) {
      const newTextarea = document.createElement('textarea');
      newTextarea.rows = '2';
      newTextarea.cols = '50';
      newTextarea.value = resultRows[i].description; // Set initial value from the database

      const newLabel = document.createElement('label');
      newLabel.textContent = 'Done';
      console.log('step1');

      const newCheckbox = document.createElement('input');
      newCheckbox.type = 'checkbox';

      const expiredLabel = document.createElement('label');
      expiredLabel.textContent = 'Expired';

      const expiredCB = document.createElement('input');
      expiredCB.type = 'checkbox';
      console.log('step2');
      const delButton=document.createElement('button');
      delButton.textContent='delete';
      document.body.appendChild(newTextarea);
      document.body.appendChild(newLabel);
      document.body.appendChild(newCheckbox);
      document.body.appendChild(expiredLabel);
      document.body.appendChild(expiredCB);
      document.body.appendChild(delButton);

      //console.log(i, 'done', resultRows[i].done);
      //console.log(i, 'expired', resultRows[i].expired);

      // Update the background color based on checkbox state
      function updateBackgroundColor() {
        newTextarea.style.backgroundColor = newCheckbox.checked ? 'green' :
          (expiredCB.checked ? 'red' : 'white');

      }

      newCheckbox.addEventListener('change', async () => {
        if(newCheckbox.checked)
          expiredCB.checked=false;
        
        updateBackgroundColor();
        ipcRenderer.send('checkbox', newCheckbox.checked, resultRows[i].todoid);

        // Update the database
        await updateDatabase(resultRows[i].todoid, newTextarea.value, newCheckbox.checked, expiredCB.checked);
      });

      expiredCB.addEventListener('change', async () => {
        
        if(expiredCB.checked)
          newCheckbox.checked=false;
        updateBackgroundColor();
        ipcRenderer.send('checkbox', expiredCB.checked, resultRows[i].todoid);

        // Update the database
        await updateDatabase(resultRows[i].todoid, newTextarea.value, newCheckbox.checked, expiredCB.checked);
      });

      newTextarea.addEventListener('input', () => {
        const textContent = newTextarea.value;
        console.log(`Textarea content: ${textContent}`);
      });

      // Set initial checkbox state and background color
      newCheckbox.checked = resultRows[i].done;
      expiredCB.checked = resultRows[i].expired;
      updateBackgroundColor();

      delButton.addEventListener('click',async()=>{
        newTextarea.remove();
        newLabel.remove();
        newCheckbox.remove();
        expiredLabel.remove();
        expiredCB.remove();
        delButton.remove();
        await postgresClient.query('DELETE  FROM todolist WHERE todoid=$1',[resultRows[i].todoid]);
    
      });

    }
  } else {
    console.error('Received data does not have the expected structure.');
  }

  // Function to update the database
  async function updateDatabase(id, description, done, expired) {
    try {
      await postgresClient.query('UPDATE todolist SET description = $1, done = $2, expired = $3 WHERE todoid = $4', [description, done, expired, id]);
      console.log('Database updated successfully.');
    } catch (error) {
      console.error('Error updating the database:', error);
    }
  }
});



