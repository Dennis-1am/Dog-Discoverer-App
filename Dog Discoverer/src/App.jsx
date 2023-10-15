import { useState } from 'react'
import { useEffect } from 'react'
import { useRef } from 'react';
import './App.css'

const API_URL = "https://api.thedogapi.com/"

function App() {
  const [dogJson, setDogJson] = useState([])
  const [currDogImage, setCurrDogImage] = useState("")
  const [currDogInfo, setCurrDogInfo] = useState([])
  const [banAttributesList, setBanAttributesList] = useState([])
  const [listOfpreviousDogs, setListOfpreviousDogs] = useState([])


  const isInitialDogSet = useRef(false);

  useEffect(() => {
    async function setInitialDog() {
      const response = await fetch(`${API_URL}v1/images/search?size=med&mime_types=jpg&format=json&has_breeds=true&order=RANDOM&page=0&limit=1`);
      const data = await response.json();
      data.forEach((item) => {
        if (item['breed_group'] === undefined) {
          item['breed_group'] = "Breed_Unknown"
        }
        if (item['origin'] === undefined || item['origin'] === '') {
          item['origin'] = "Origin_Unknown"
        }
      })
      setCurrDogImage(data[0].url);
      console.log(data[0]);
    }
  
    async function fetchDogs() {
      const response = await fetch(`${API_URL}v1/breeds`);
      const data = await response.json();
      data.forEach((item) => {
        if (item['breed_group'] === undefined) {
          item['breed_group'] = "Breed_Unknown"
        }
        if (item['origin'] === undefined || item['origin'] === '') {
          item['origin'] = "Origin_Unknown"
        }
      })
      setDogJson(JSON.parse(JSON.stringify(data)));
    }
  
    if (!isInitialDogSet.current) {
      setInitialDog();
      fetchDogs();
    }
  
    isInitialDogSet.current = true;
  }, []);
  
  const filterDogJson = () => {
    let filteredDogJson = dogJson.filter((item) => {
      if (banAttributesList.includes(item['life_span']) || banAttributesList.includes(item['origin']) || banAttributesList.includes(item['weight']['imperial']) || banAttributesList.includes(item['breed_group'])) {
        return false
      } else {
        return true
      }
    })
    return filteredDogJson
  }

  const previousDogs = () => {
    if (listOfpreviousDogs.length === 2) {
      listOfpreviousDogs.shift()
      setListOfpreviousDogs([...listOfpreviousDogs, currDogImage])
    } else {
      setListOfpreviousDogs([...listOfpreviousDogs, currDogImage])
    }
  }

  const getDogImage = async () => {
    let f_dog_json = filterDogJson()
    console.log(f_dog_json.length)
    let random_num = Math.floor(Math.random() * (f_dog_json.length-1));
    let dog = f_dog_json[random_num]['reference_image_id'];
    const response = await fetch(`${API_URL}v1/images/${dog}`);
    const data = await response.json();
    setCurrDogImage(data.url);
    await new Promise(r => setTimeout(r, 500));

    let dogJsonInfo = {
      name: f_dog_json[random_num]['name'],
      breed: f_dog_json[random_num]['breed_group'],
      life_span: f_dog_json[random_num]['life_span'],
      origin: f_dog_json[random_num]['origin'],
      weight: f_dog_json[random_num]['weight']['imperial'] ? f_dog_json[random_num]['weight']['imperial'] : "Unknown"
    }
    previousDogs();
    setCurrDogInfo(dogJsonInfo);
  }

  const banAttribute = (attribute) => {
    if(attribute === undefined) {
      return
    } else if (banAttributesList.includes(attribute)) {
      return
    } else {
      setBanAttributesList([...banAttributesList, attribute])
    }
  }

  const removeAttribute = (attribute) => {
    let newBanAttributesList = banAttributesList.filter((item) => item !== attribute)
    setBanAttributesList(newBanAttributesList)
  }

  return (
    <div className='app-container'>
      <div className='previousDog'>
        <h1>Previous Viewed Dogs</h1>
          {listOfpreviousDogs.map((dog, index) => (
            <img id={index} src={dog} key={index}></img>
          ))}
      </div>
      <div className='header'>
        <h1>Wondering what dog to get next?</h1>
        <button onClick={getDogImage}> Get Dog </button>
        <h3>{currDogInfo.name}</h3>
        <h4>Dog Information</h4>
        <div className='dog-information-container'>
        <button onClick={() => banAttribute(currDogInfo.life_span)}>Life Span: {currDogInfo.life_span}</button>
        <button onClick={() => banAttribute(currDogInfo.origin)}>Origin: {currDogInfo.origin}</button>
        <button onClick={() => banAttribute(currDogInfo.weight)}> Weight lb: {currDogInfo.weight}</button>
        <button onClick={() => banAttribute(currDogInfo.breed)}>Breed: {currDogInfo.breed}</button>
      </div>
      <img src={currDogImage}></img>
      </div>
     
      <div className='sidebar'>
        <h1>Banned Attributes</h1>
        {banAttributesList.map((attribute, index) => (
            <button onClick={() => removeAttribute(attribute)} key={index}>{attribute}</button>
        ))}
      </div>
    </div>
  )

}

export default App
