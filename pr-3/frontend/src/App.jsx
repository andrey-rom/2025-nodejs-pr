import { useState, useEffect } from 'react'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Card } from 'primereact/card'
import { Message } from 'primereact/message'

const API = 'http://localhost:3000/api'

function App() {
  const [students, setStudents] = useState([])
  const [message, setMessage] = useState('')
  const [averageAge, setAverageAge] = useState(0)
  const [backupStatus, setBackupStatus] = useState('stopped')

  useEffect(() => {
    loadStudents()
    loadAverageAge()
    loadBackupStatus()
  }, [])

  const showMessage = (msg) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }

  const loadStudents = async () => {
    try {
      const res = await fetch(`${API}/students`)
      const data = await res.json()
      setStudents(data)
    } catch (err) {
      showMessage('error: ' + err.message)
    }
  }

  const loadAverageAge = async () => {
    try {
      const res = await fetch(`${API}/students/average-age`)
      const data = await res.json()
      setAverageAge(data.averageAge)
    } catch (err) {
      showMessage('error: ' + err.message)
    }
  }

  const loadBackupStatus = async () => {
    try {
      const res = await fetch(`${API}/backup/status`)
      const data = await res.json()
      setBackupStatus(data.status)
    } catch (err) {
      showMessage('error: ' + err.message)
    }
  }

  const addStudent = async (e) => {
    e.preventDefault()
    const form = e.target
    const name = form.name.value
    const age = form.age.value
    const group = form.group.value

    try {
      const res = await fetch(`${API}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, age: Number(age), group: Number(group) })
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      
      showMessage('student added')
      form.reset()
      loadStudents()
      loadAverageAge()
    } catch (err) {
      showMessage('error: ' + err.message)
    }
  }

  const deleteStudent = async (id) => {
    if (!confirm('delete student?')) return
    
    try {
      const res = await fetch(`${API}/students/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      
      showMessage('student deleted')
      loadStudents()
      loadAverageAge()
    } catch (err) {
      showMessage('error: ' + err.message)
    }
  }

  const updateAge = async (id, currentAge) => {
    const newAge = prompt('new age:', currentAge)
    if (!newAge) return
    
    try {
      const res = await fetch(`${API}/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ age: Number(newAge) })
      })
      
      if (!res.ok) throw new Error('update failed')
      
      showMessage('student updated')
      loadStudents()
      loadAverageAge()
    } catch (err) {
      showMessage('error: ' + err.message)
    }
  }

  const filterByGroup = async () => {
    const group = prompt('enter group number:')
    if (!group) {
      loadStudents()
      return
    }
    
    try {
      const res = await fetch(`${API}/students/group/${group}`)
      const data = await res.json()
      setStudents(data)
    } catch (err) {
      showMessage('error: ' + err.message)
    }
  }

  const saveToFile = async () => {
    try {
      await fetch(`${API}/students/save`, { method: 'POST' })
      showMessage('saved to file')
    } catch (err) {
      showMessage('error: ' + err.message)
    }
  }

  const loadFromFile = async () => {
    if (!confirm('load from file?')) return
    
    try {
      await fetch(`${API}/students/load`, { method: 'POST' })
      showMessage('loaded from file')
      loadStudents()
      loadAverageAge()
    } catch (err) {
      showMessage('error: ' + err.message)
    }
  }

  const getStudentById = async () => {
    const id = prompt('enter student id:')
    if (!id) return
    
    try {
      const res = await fetch(`${API}/students/${id}`)
      if (!res.ok) throw new Error('student not found')
      
      const student = await res.json()
      alert(`student: ${student.name}, age: ${student.age}, group: ${student.group}`)
    } catch (err) {
      showMessage('error: ' + err.message)
    }
  }

  const replaceAllStudents = async () => {
    if (!confirm('replace all students? this will delete current data!')) return
    
    const data = prompt('enter JSON array of students:')
    if (!data) return
    
    try {
      const students = JSON.parse(data)
      const res = await fetch(`${API}/students`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(students)
      })
      
      if (!res.ok) throw new Error('replace failed')
      
      showMessage('collection replaced')
      loadStudents()
      loadAverageAge()
    } catch (err) {
      showMessage('error: ' + err.message)
    }
  }

  const startBackup = async () => {
    try {
      const res = await fetch(`${API}/backup/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intervalMs: 10000 })
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      
      showMessage('backup started')
      loadBackupStatus()
    } catch (err) {
      showMessage('error: ' + err.message)
    }
  }

  const stopBackup = async () => {
    try {
      await fetch(`${API}/backup/stop`, { method: 'POST' })
      showMessage('backup stopped')
      loadBackupStatus()
    } catch (err) {
      showMessage('error: ' + err.message)
    }
  }

  const actionTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button 
          icon="pi pi-pencil" 
          rounded 
          text 
          severity="info" 
          onClick={() => updateAge(rowData.id, rowData.age)} 
        />
        <Button 
          icon="pi pi-trash" 
          rounded 
          text 
          severity="danger" 
          onClick={() => deleteStudent(rowData.id)} 
        />
      </div>
    )
  }

  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold mb-4">student management</h1>

      {message && (
        <Message severity="info" text={message} className="mb-3" />
      )}

      <Card className="mb-3">
        <p><strong>total:</strong> {students.length} | <strong>average age:</strong> {averageAge.toFixed(1)}</p>
        <p><strong>backup:</strong> {backupStatus}</p>
      </Card>

      <Card title="add new student" className="mb-3">
        <form onSubmit={addStudent} className="flex gap-2">
          <InputText name="name" placeholder="name" required />
          <InputText name="age" type="number" placeholder="age" required />
          <InputText name="group" type="number" placeholder="group" required />
          <Button label="add" icon="pi pi-plus" type="submit" />
        </form>
      </Card>

      <div className="flex gap-2 mb-3 flex-wrap">
        <Button label="refresh" icon="pi pi-refresh" onClick={loadStudents} />
        <Button label="get by id" icon="pi pi-search" severity="secondary" onClick={getStudentById} />
        <Button label="filter by group" icon="pi pi-filter" severity="secondary" onClick={filterByGroup} />
        <Button label="save" icon="pi pi-save" severity="success" onClick={saveToFile} />
        <Button label="load" icon="pi pi-upload" severity="success" onClick={loadFromFile} />
        <Button label="replace all" icon="pi pi-sync" severity="warning" onClick={replaceAllStudents} />
        <Button label="start backup" icon="pi pi-play" severity="help" onClick={startBackup} />
        <Button label="stop backup" icon="pi pi-stop" severity="danger" onClick={stopBackup} />
      </div>

      <DataTable value={students} stripedRows showGridlines>
        <Column field="id" header="id" />
        <Column field="name" header="name" />
        <Column field="age" header="age" />
        <Column field="group" header="group" />
        <Column body={actionTemplate} header="actions" />
      </DataTable>
    </div>
  )
}

export default App
