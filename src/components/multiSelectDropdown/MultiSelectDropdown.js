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
    const [drugList, setDrugList] = useState([]);
    const [drugListError, setDrugListError] = useState([]);
    const [listLoading, setListLoading] = useState(false);



    console.log(drugListError, "---");

    const symptomsArray = symptomsText.split('\n');

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
        const matchingDiseases = medicalData.filter(disease => {
            return selectedSymptoms.every(symptom => disease.symptoms.includes(symptom));
        });

        return matchingDiseases.map(disease => disease.disease);
    };

    const matchingDiseases = getMatchingDiseases();
    let uniquematchingDiseases = [...new Set(matchingDiseases)];

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
                return response.data;
            } catch (error) {
                setDrugListError(error.response?.data.detail)
                toast.error(`Error fetching drug list for ${disease}: ${error.response?.data.detail}`);
                setListLoading(false);
                return [];
            }
        };

        const fetchDrugLists = async () => {
            const drugLists = await Promise.all(selectedDiseases.map(disease => fetchDrugList(disease)));
            setDrugList(drugLists.flat());
        };

        if (selectedDiseases.length > 0) {
            fetchDrugLists();
        }
        else {
            setDrugList([]);
        }
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
                                                {uniquematchingDiseases.length > 0 ? (
                                                    uniquematchingDiseases.map(disease => (
                                                        <Form.Check
                                                            key={disease}
                                                            type="checkbox"
                                                            id={disease}
                                                            label={disease}
                                                            onChange={handleDiseaseChange}
                                                        />
                                                    ))
                                                ) : (
                                                    <h2 className='mt-3 matchingDiseases'>No matching diseases found</h2>
                                                )}
                                            </Form>
                                        </ul>
                                    </Card.Body>
                                </Card>
                            </Col>
                        )}
                        {drugList.length > 0 && (
                            <Col md={4}>
                                <Card className='mt-5'>
                                    <Card.Body>
                                        <Card.Title>Drug List</Card.Title>
                                        {listLoading ? (
                                            <>
                                                <div className='d-flex align-items-center mt-3'>
                                                    <h2 className='loadingText'>Loading..</h2>
                                                    <Spinner animation="border" variant="primary" />
                                                </div>
                                            </>
                                        ) : (
                                            <ul>
                                                {drugList.map(drug => (
                                                    <li key={drug}>{drug}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        )}
                    </Row>
                </div>
            </Container>

        </React.Fragment>
    );
};

export default MultiSelectDropdown;
