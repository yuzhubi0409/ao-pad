import './App.css';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer} from "recharts"
import React, { useState, useEffect } from "react";
import courtBg from './BACKGROUND.png';
// UseState--to store the data React fetches 2.
// UseEffect--to fetch data when the page loads



function FatigueGraph(props) {
  const data = Array.isArray(props.data) ? props.data: []
  
  return (
    <ResponsiveContainer width = "100%" height = {200}>
      <LineChart data = {data}>
        <XAxis dataKey = "time" />
        <YAxis />
        <Line dataKey = "alcaraz" stroke = "#8B5CF6"/>
        <Line dataKey = "sinner" stroke = "#F59E0B"/>
      </LineChart>
    </ResponsiveContainer>
  )
}



function Playercard(props) {
  return (
    <div className = "player-card">
      <p className = "player-name">{props.name}</p>
      <p className = "fatigue-score">{props.score}</p>
      <p className = "left-thigh">Left thigh: {props.leftThigh}</p>
      <p className = "right-thigh">Right thigh: {props.rightThigh}</p>
      <p className = "status">{props.status}</p>
    </div>
  );
}

function getStatus(score) {
  if (score > 70) return "Critical"
  if (score > 40) return "Monitor"
  return "Stable"
}
/*
function SignalChart({ data, xKey, yKey, title, color }) {
  return (
    <div>
      <p className="chart-title">{title}</p>
      <ResponsiveContainer width="100%" height={150}>
        <LineChart data={data}>
          <XAxis dataKey={xKey} hide={true} />
          <YAxis />
          <Line dataKey={yKey} stroke={color} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
*/
function SignalChart({ data, xKey, yKey, title, color }) {
  return (
    <div className="signal-chart">
      <p className="chart-title">{title}</p>
      <ResponsiveContainer width="100%" height={150}>
        <LineChart data={data}>
          <XAxis 
            dataKey={xKey} 
            tick={{ fill: '#444', fontSize: 10 }}
            label={{ value: xKey, position: 'insideBottom', offset: -2, fontSize: 10, fill: '#444' }}
          />
          <YAxis 
            tick={{ fill: '#444', fontSize: 10 }}
            label={{ value: yKey, angle: -90, position: 'insideLeft', fontSize: 10, fill: '#444' }}
          />
          <Line dataKey={yKey} stroke="#1a6fb5" dot={false} strokeWidth={1} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}



function App() {
  const [players, setPlayers] = useState(null)
  const [history, setHistory] = useState([])
  const [signalData, setSignalData] = useState({
    raw: [],
    fft: [],
    filtered: [],
    variance: []
  })

  useEffect(() => { 
      
    fetch("http://127.0.0.1:8000/fatigue")
      .then(res => res.json())
      .then(data => {
      setPlayers(data)
      setHistory(prev => [
        ...prev,
        {
          time: prev.length,
          alcaraz: data.alcaraz.score,
          sinner: data.sinner.score
        }
        ].slice(-20))
        if (data.signal) {
          setSignalData(data.signal)
        }
        })
      .catch(err => console.log("API offline"))
      
      const interval = setInterval(() => {
        fetch("http://127.0.0.1:8000/fatigue")
          .then(res => res.json())
          .then(data => {
            setPlayers(data)
            setHistory(prev => [
              ...prev,

              {
                time: prev.length,
                alcaraz: data.alcaraz.score,
                sinner: data.sinner.score
              }
            ].slice(-20))

          })
        }, 2000)
        return () => clearInterval(interval)
      }, [])

    if (players == null)
        return (
        /*<div className = /*"dashboard">*/
          <div className="dashboard" style={{ backgroundImage: `url(${courtBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
            <h1 className = "logo">AO Pad</h1>
            <Playercard 
              name = "Alcaraz"
              score = "__"
              leftThigh = "__"
              rightThigh = "__"
              status = "__"
            />
            <Playercard 
              name = "Sinner"
              score = "__"
              leftThigh = "__"
              rightThigh = "__"
              status = "__"
            /> 
            <FatigueGraph data = {history}
            />
            </div>
          )
    return (
      <div className="dashboard" style={{ backgroundImage: `url(${courtBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
        <div className = "header">
          <h1 className = "logo">AO Pad</h1>
          <span className = "match-badge">Australian Open 2026 . Coaching Team Only</span>
        </div>

        <div className="main-content">
          <div className="charts-col">
            <SignalChart data={signalData.raw} xKey="time" yKey="value" title="Raw Signal" color="#8B5CF6" />
            <SignalChart data={signalData.filtered} xKey="time" yKey="value" title="Filtered Signal" color="#1D9E75" />
            <SignalChart data={signalData.variance} xKey="time" yKey="value" title="Fatigue Variance" color="#EF9F27" />
            <SignalChart data={signalData.fft} xKey="freq" yKey="amp" title="FFT Spectrum" color="#4a9eff" />
          </div>
          <div className="cards-col">
            <Playercard 
              name = "Alcaraz"
              score = {players.alcaraz.score}
              leftThigh = {players.alcaraz.leftThigh}
              rightThigh = {players.alcaraz.rightThigh}
              status = {getStatus(players.alcaraz.score)}
            />
            <Playercard 
              name = "Sinner"
              score = {players.sinner.score}
              leftThigh = {players.sinner.leftThigh}
              rightThigh = {players.sinner.rightThigh}
              status = {getStatus(players.sinner.score)}
            />  
          </div>
        </div>
        <div className="footer">
      <span className="footer-text">Session · AO 2026 · Rod Laver Arena</span>
      <span className="enc-badge"><span className="enc-dot"></span>Encrypted · Private</span>
    </div>
  </div>
)
}
export default App;