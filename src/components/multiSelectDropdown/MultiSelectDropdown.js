import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { symptomsText, medicalData } from "../../common/symptoms/SymptomsList";
import axios from 'axios';
import { Container, Form, Card, Row, Col, Spinner } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MultiSelectDropdown = () => {

    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedDiseases, setSelectedDiseases] = useState([]);
    const [diseaseData, setDiseaseData] = useState([]);
    const [listLoading, setListLoading] = useState(false);

    const symptomsArray = symptomsText.split('\n');
    console.log(symptomsArray, "symptomsArray");
    const symptomsData = symptomsArray.map(symptom => ({
        label: symptom,
        value: symptom.replace(/_/g, ' ')
    }));

    const options = symptomsData.map(item => ({
        label: item.value,
        value: item.label
    }));

    const getMatchingDiseases = () => {
        const selectedSymptoms = selectedItems.map(item => item.value.trim());
        return medicalData.filter(disease => {
            return selectedSymptoms.every(symptom => disease.symptoms.includes(symptom));
        });
    };

    const handleChange = selectedOptions => {
        setSelectedItems(selectedOptions);
    };

    const handleDiseaseChange = (event) => {
        const { id, checked } = event.target;
        if (checked) {
            setSelectedDiseases(prevSelectedDiseases => [...prevSelectedDiseases, id]);
        } else {
            setSelectedDiseases(prevSelectedDiseases => prevSelectedDiseases.filter(disease => disease !== id));
        }
    };

    useEffect(() => {
        const fetchDrugList = async (disease) => {
            try {
                setListLoading(true);
                const response = await axios.get(`https://candidate-assignment-5hohk5qryq-as.a.run.app/getDrugs/${disease}`);
                setListLoading(false);
                return { disease, drugs: response.data };
            } catch (error) {
                toast.error(`Error fetching drug list for ${disease}: ${error.response?.data.detail}`);
                setListLoading(false);
                return { disease, drugs: [] };
            }
        };

        const fetchDataForSelectedDiseases = async () => {
            const diseaseData = await Promise.all(selectedDiseases.map(disease => fetchDrugList(disease)));
            setDiseaseData(diseaseData);
        };

        fetchDataForSelectedDiseases();
    }, [selectedDiseases]);

    return (
        <React.Fragment>
            <ToastContainer />
            <Container className='mt-5'>
                <div>
                    <Select
                        isMulti
                        options={options}
                        value={selectedItems}
                        onChange={handleChange}
                        placeholder="Select symptoms (multiple options allowed)"
                    />
                </div>
                <div>
                    <Row>
                        {selectedItems.length > 0 && (
                            <Col md={4}>
                                <Card className='mt-5'>
                                    <Card.Body>
                                        <Card.Title>Selected symptoms</Card.Title>
                                        <ul>
                                            {selectedItems.map(item => (
                                                <li key={item.value}>
                                                    {item.label}
                                                </li>
                                            ))}
                                        </ul>
                                    </Card.Body>
                                </Card>
                            </Col>
                        )}
                        {selectedItems.length > 0 && (
                            <Col md={4}>
                                <Card className='mt-5'>
                                    <Card.Body>
                                        <Card.Title>Matching Diseases</Card.Title>
                                        <ul>
                                            <Form>
                                                {getMatchingDiseases().map(disease => (
                                                    <Form.Check
                                                        key={disease.disease}
                                                        type="checkbox"
                                                        id={disease.disease}
                                                        label={disease.disease}
                                                        onChange={handleDiseaseChange}
                                                    />
                                                ))}
                                            </Form>
                                        </ul>
                                    </Card.Body>
                                </Card>
                            </Col>
                        )}
                        {diseaseData.map(({ disease, drugs }) => (
                            <Col md={4} key={disease}>
                                <Card className='mt-5'>
                                    <Card.Body>
                                        <Card.Title>{disease}</Card.Title>
                                        {listLoading ? (
                                            <>
                                                <div className='d-flex align-items-center mt-3'>
                                                    <h2 className='loadingText'>Loading..</h2>
                                                    <Spinner animation="border" variant="primary" />
                                                </div>
                                            </>
                                        ) : (
                                            <ul>
                                                {drugs.map((drug, index) => (
                                                    <li key={index}>{drug}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            </Container>
        </React.Fragment>
    );
};

export default MultiSelectDropdown;
