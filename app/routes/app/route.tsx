import { useState, useEffect } from 'react';

interface Task {
  name: string;
  duration: number; // Duration in minutes
}

interface FormState {
  currentTime: string;
  bedtime: string;
  totalMinutesLeft: number;
  tasks: Task[];
}

export default function Route() {
  const [step, setStep] = useState<number>(0);
  const [formData, setFormData] = useState<FormState>({
    currentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    bedtime: '',
    totalMinutesLeft: 0,
    tasks: []
  });

  useEffect(() => {
    const data = localStorage.getItem('formData');
    if (data) {
      setFormData(JSON.parse(data));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('formData', JSON.stringify(formData));
  }, [formData]);

  const handleNextStep = () => {
    if (step === 0) {
      // Calculate total available minutes when setting the bedtime
      const bedtimeDate = new Date(`1970/01/01 ${formData.bedtime}`);
      const currentTimeDate = new Date(`1970/01/01 ${formData.currentTime}`);
      const totalMinutesLeft = (bedtimeDate.getTime() - currentTimeDate.getTime()) / 60000; // Convert ms to minutes
      setFormData({ ...formData, totalMinutesLeft });
    }
    setStep(prevStep => prevStep + 1);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleTaskChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const newTasks = [...formData.tasks];
    const value = event.target.name === 'duration' ? parseInt(event.target.value) || 0 : event.target.value;
    newTasks[index] = { ...newTasks[index], [event.target.name]: value };
    setFormData({ ...formData, tasks: newTasks });
  };

  const addTask = () => {
    const newTask = { name: '', duration: 0 };
    setFormData(prevState => ({
      ...prevState,
      tasks: [...prevState.tasks, newTask],
      totalMinutesLeft: prevState.totalMinutesLeft // This line is now correctly using prevState
    }));
  };

  const calculateTimeLeft = () => {
    // Subtract task durations from the total minutes left
    const totalTaskTime = formData.tasks.reduce((total, task) => total + task.duration, 0);
    const remainingTime = formData.totalMinutesLeft - totalTaskTime;
    const hours = Math.floor(remainingTime / 60);
    const minutes = remainingTime % 60;
    return `${hours} hours and ${minutes} minutes`;
  };

  return (
    <div className="mx-auto flex h-screen w-full max-w-[1440px] flex-col items-center justify-center p-4">
      {step === 0 && (
        <div>
          <p>It's {formData.currentTime}, what time do you want to go to bed?</p>
          <input
            type="time"
            name="bedtime"
            value={formData.bedtime}
            onChange={handleInputChange}
            className="border p-2"
          />
          <button onClick={handleNextStep} className="ml-4 rounded bg-blue-500 py-2 px-4 text-white">Next</button>
        </div>
      )}

      {step === 1 && (
        <div>
          <p>You have {calculateTimeLeft()} until bedtime. Plan your tasks:</p>
          {formData.tasks.map((task, index) => (
            <div key={index}>
              <input
                type="text"
                name="name"
                value={task.name}
                onChange={(e) => handleTaskChange(index, e)}
                placeholder="Task name"
                className="border p-2"
              />
              <input
                type="number"
                name="duration"
                value={task.duration}
                onChange={(e) => handleTaskChange(index, e)}
                placeholder="Duration in minutes"
                className="border p-2"
              />
            </div>
          ))}
          <button onClick={addTask} className="mt-2 rounded bg-green-500 py-2 px-4 text-white">Add Task</button>
          <button onClick={handleNextStep} className="ml-4 rounded bg-blue-500 py-2 px-4 text-white">Finish</button>
          <button onClick={() => setStep(0)} className="mt-4 rounded bg-red-500 py-2 px-4 text-white">Reset</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <p>Here's your plan for the rest of the day:</p>
          {formData.tasks.map((task, index) => (
            <div key={index}>
              <p>{task.name} - {task.duration} minutes</p>
            </div>
          ))}
          <button onClick={() => setStep(0)} className="mt-4 rounded bg-red-500 py-2 px-4 text-white">Reset</button>
        </div>
      )}
    </div>
  );
}
