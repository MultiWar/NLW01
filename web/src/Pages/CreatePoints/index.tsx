import React, {useState, useEffect, ChangeEvent, FormEvent} from 'react';
import {Link, useHistory} from 'react-router-dom';
import {FiArrowLeft} from 'react-icons/fi';
import {Map, TileLayer, Marker } from 'react-leaflet';
import {LeafletMouseEvent} from 'leaflet';
import axios from 'axios';

import Dropzone from '../../components/dropzone';

import api from '../../services/api';
import './styles.css';

import Logo from '../../assets/logo.svg';



//array ou objeto em useState: informar manualmente o tipo das propriedades

interface item {
    id: number,
    nome: string,
    imagem_url: string
}

interface IBGEUFResponseData {
    sigla: string
}

interface IBGEMunicipiosData {
    nome: string
}

const CreatePoints = () => {

    const history = useHistory();

    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        whatsapp: ''
    })
    const [itens, setItens] = useState<item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [municipios, setMunicipios] = useState<string[]>([]);
    const [ufSelecionada, setUfSelecionada] = useState('0');
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0]);
    const [latLong, setLatLong] = useState<[number, number]>([0, 0]);
    const [cidadeSelecionada, setCidadeSelecionada] = useState('0');
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [selectedFile, setSelectedFile] = useState<File>();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const {latitude, longitude} = position.coords;
            setInitialPosition([latitude, longitude]);
        })
    }, [])

    useEffect(() => {
        api.get('itens').then(response => {
            setItens(response.data);
        })
    }, []);

    useEffect(() => {
        axios.get<IBGEUFResponseData[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderby=nome').then(response => {
            const ufInitials = response.data.map(uf => uf.sigla);
            setUfs(ufInitials);
        })
    }, []);

    useEffect(() => {
        axios.get<IBGEMunicipiosData[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufSelecionada}/municipios?orderby=nome`).then(response => {
            const municipio = response.data.map(mun => mun.nome);
            setMunicipios(municipio);
        })
    }, [ufSelecionada]);

    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value;
        setUfSelecionada(uf);
    }

    function handleSelectCidade(event: ChangeEvent<HTMLSelectElement>) {
        const cidade = event.target.value;
        setCidadeSelecionada(cidade);
    }

    function handleMapClick(event: LeafletMouseEvent) {
        setLatLong([
            event.latlng.lat,
            event.latlng.lng
        ]);
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const {name, value} = event.target

        setFormData({
            ...formData,
            [name]: value
        })
    }

    function handleSelectItem(id: number) {
        const alreadySelected = selectedItems.findIndex(item => item === id);
        if(alreadySelected>=0) {
            const filteredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filteredItems);
        }
        else {
            setSelectedItems([...selectedItems, id]);
        }
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        
        const {nome, email, whatsapp} = formData;
        const uf = ufSelecionada;
        const cidade = cidadeSelecionada;
        const latitude = latLong[0];
        const longitude = latLong[1];
        const itens = selectedItems;

        const data = new FormData();



        data.append('nome', nome);
        data.append('email', email);
        data.append('whatsapp', whatsapp);
        data.append('latitude', String(latitude));
        data.append('longitude', String(longitude));
        data.append('uf', uf);
        data.append('cidade', cidade);
        data.append('itens', itens.join(','));
        
        if(selectedFile) {
            data.append('imagem', selectedFile)
        }

        try {
            await api.post('pontos', data);
            alert('Ponto criado com sucesso');
            history.push("/");
        }
        catch(err) {
            alert('vish');
        }
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={Logo} alt="Ecoleta"/>
                <Link to="/"><FiArrowLeft />Voltar para a home</Link>
            </header>
            <form onSubmit={handleSubmit}>
                <h1>Cadastro do ponto de coleta</h1>

                <Dropzone onFileUploaded={setSelectedFile} />

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="nome">
                            Nome da Entidade
                        </label>
                        <input 
                            type="text" 
                            name="nome"
                            id="nome"
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">
                                E-mail
                            </label>
                            <input 
                                type="email" 
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">
                                Whatsapp
                            </label>
                            <input 
                                type="text" 
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={latLong}/>
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf" value={ufSelecionada} onChange={handleSelectUf}>
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" value={cidadeSelecionada} onChange={handleSelectCidade}>
                                <option value="0">Selecione uma cidade</option>
                                {municipios.map(mun => (
                                    <option key={mun} value={mun}>{mun}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Itens de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>
                    <ul className="items-grid">
                        {itens.map(item => (
                            <li 
                                key={item.id} 
                                onClick={() => handleSelectItem(item.id)}
                                className={selectedItems.includes(item.id) ? 'selected' : ''}
                            >
                                <img src={item.imagem_url} alt={item.nome} />
                                <span>{item.nome}</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>
                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>
    )
}

export default CreatePoints;