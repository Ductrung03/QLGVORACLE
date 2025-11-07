"use client"

import React, { Fragment, useState, useEffect } from 'react';
import { Row, Col, Card, Nav, Tab, Table, Button, Modal, Form, Alert, Badge, Spinner } from 'react-bootstrap';
import Seo from '@/shared/layouts-components/seo/seo';
import SpkButton from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons';

interface HocHam {
  maHocHam: string;
  tenHocHam: string;
  moTa?: string;
}

interface HocVi {
  maHocVi: string;
  tenHocVi: string;
  moTa?: string;
}

const DegreesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hocham' | 'hocvi'>('hocham');

  // Học hàm state
  const [hochamList, setHochamList] = useState<HocHam[]>([]);
  const [hochamLoading, setHochamLoading] = useState(true);
  const [showHochamForm, setShowHochamForm] = useState(false);
  const [editingHocham, setEditingHocham] = useState<HocHam | null>(null);
  const [hochamSearch, setHochamSearch] = useState('');

  // Học vị state
  const [hocviList, setHocviList] = useState<HocVi[]>([]);
  const [hocviLoading, setHocviLoading] = useState(true);
  const [showHocviForm, setShowHocviForm] = useState(false);
  const [editingHocvi, setEditingHocvi] = useState<HocVi | null>(null);
  const [hocviSearch, setHocviSearch] = useState('');

  // Form state
  const [formData, setFormData] = useState({ ma: '', ten: '', moTa: '' });
  const [formErrors, setFormErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetchHocham();
    fetchHocvi();
  }, []);

  const fetchHocham = async () => {
    try {
      setHochamLoading(true);
      const response = await fetch('/api/degrees/hocham');
      if (response.ok) {
        const data = await response.json();
        setHochamList(data);
      }
    } catch (error) {
      console.error('Error fetching hocham:', error);
    } finally {
      setHochamLoading(false);
    }
  };

  const fetchHocvi = async () => {
    try {
      setHocviLoading(true);
      const response = await fetch('/api/degrees/hocvi');
      if (response.ok) {
        const data = await response.json();
        setHocviList(data);
      }
    } catch (error) {
      console.error('Error fetching hocvi:', error);
    } finally {
      setHocviLoading(false);
    }
  };

  const handleAddHocham = () => {
    setEditingHocham(null);
    setFormData({ ma: '', ten: '', moTa: '' });
    setFormErrors({});
    setSubmitError(null);
    setShowHochamForm(true);
  };

  const handleEditHocham = (item: HocHam) => {
    setEditingHocham(item);
    setFormData({ ma: item.maHocHam, ten: item.tenHocHam, moTa: item.moTa || '' });
    setFormErrors({});
    setSubmitError(null);
    setShowHochamForm(true);
  };

  const handleDeleteHocham = async (ma: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa học hàm này?')) return;

    try {
      const response = await fetch(`/api/degrees/hocham?id=${ma}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchHocham();
      } else {
        const data = await response.json();
        alert(`Lỗi: ${data.message}`);
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa học hàm');
    }
  };

  const handleAddHocvi = () => {
    setEditingHocvi(null);
    setFormData({ ma: '', ten: '', moTa: '' });
    setFormErrors({});
    setSubmitError(null);
    setShowHocviForm(true);
  };

  const handleEditHocvi = (item: HocVi) => {
    setEditingHocvi(item);
    setFormData({ ma: item.maHocVi, ten: item.tenHocVi, moTa: item.moTa || '' });
    setFormErrors({});
    setSubmitError(null);
    setShowHocviForm(true);
  };

  const handleDeleteHocvi = async (ma: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa học vị này?')) return;

    try {
      const response = await fetch(`/api/degrees/hocvi?id=${ma}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchHocvi();
      } else {
        const data = await response.json();
        alert(`Lỗi: ${data.message}`);
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa học vị');
    }
  };

  const handleSubmitHocham = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.ma || !formData.ten) {
      setFormErrors({ ma: !formData.ma, ten: !formData.ten });
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const isEdit = !!editingHocham;
      const response = await fetch('/api/degrees/hocham', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maHocHam: formData.ma,
          tenHocHam: formData.ten,
          moTa: formData.moTa
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setShowHochamForm(false);
      fetchHocham();
    } catch (error: any) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitHocvi = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.ma || !formData.ten) {
      setFormErrors({ ma: !formData.ma, ten: !formData.ten });
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const isEdit = !!editingHocvi;
      const response = await fetch('/api/degrees/hocvi', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maHocVi: formData.ma,
          tenHocVi: formData.ten,
          moTa: formData.moTa
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setShowHocviForm(false);
      fetchHocvi();
    } catch (error: any) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredHocham = hochamList.filter(item =>
    item.tenHocHam.toLowerCase().includes(hochamSearch.toLowerCase()) ||
    item.maHocHam.toLowerCase().includes(hochamSearch.toLowerCase())
  );

  const filteredHocvi = hocviList.filter(item =>
    item.tenHocVi.toLowerCase().includes(hocviSearch.toLowerCase()) ||
    item.maHocVi.toLowerCase().includes(hocviSearch.toLowerCase())
  );

  return (
    <Fragment>
      <Seo title="Quản lý Học hàm & Học vị" />

      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-semibold mb-1">
            <i className="ri-graduation-cap-line me-2 text-success"></i>
            Quản lý Học hàm & Học vị
          </h4>
          <p className="text-muted mb-0">Quản lý học hàm và học vị của giáo viên</p>
        </div>
      </div>

      <Row className="mb-4">
        <Col xl={3} lg={6} md={6} sm={12}>
          <Card className="custom-card border-0 shadow-sm overflow-hidden">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div className="flex-grow-1">
                  <p className="mb-2 text-muted fw-medium fs-13">Tổng Học hàm</p>
                  <h3 className="fw-bold mb-0 text-primary">{hochamList.length}</h3>
                </div>
                <div className="avatar avatar-xl bg-primary-transparent rounded-circle">
                  <i className="ri-award-line fs-2 text-primary"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6} sm={12}>
          <Card className="custom-card border-0 shadow-sm overflow-hidden">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div className="flex-grow-1">
                  <p className="mb-2 text-muted fw-medium fs-13">Tổng Học vị</p>
                  <h3 className="fw-bold mb-0 text-success">{hocviList.length}</h3>
                </div>
                <div className="avatar avatar-xl bg-success-transparent rounded-circle">
                  <i className="ri-graduation-cap-line fs-2 text-success"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6} sm={12}>
          <Card className="custom-card border-0 shadow-sm overflow-hidden">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div className="flex-grow-1">
                  <p className="mb-2 text-muted fw-medium fs-13">Giáo sư</p>
                  <h3 className="fw-bold mb-0 text-info">5</h3>
                </div>
                <div className="avatar avatar-xl bg-info-transparent rounded-circle">
                  <i className="ri-user-star-line fs-2 text-info"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6} sm={12}>
          <Card className="custom-card border-0 shadow-sm overflow-hidden">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div className="flex-grow-1">
                  <p className="mb-2 text-muted fw-medium fs-13">Tiến sĩ</p>
                  <h3 className="fw-bold mb-0 text-warning">25</h3>
                </div>
                <div className="avatar avatar-xl bg-warning-transparent rounded-circle">
                  <i className="ri-shield-star-line fs-2 text-warning"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xl={12}>
          <Card className="custom-card">
            <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k as any)}>
              <Card.Header>
                <Nav variant="tabs" className="nav-tabs-header mb-0">
                  <Nav.Item>
                    <Nav.Link eventKey="hocham" className="text-decoration-none">
                      <i className="ri-award-line me-2"></i>Học hàm
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="hocvi" className="text-decoration-none">
                      <i className="ri-graduation-cap-line me-2"></i>Học vị
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Header>
              <Card.Body>
                <Tab.Content>
                  {/* Học hàm Tab */}
                  <Tab.Pane eventKey="hocham">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Tìm kiếm học hàm..."
                        value={hochamSearch}
                        onChange={(e) => setHochamSearch(e.target.value)}
                        style={{ maxWidth: '300px' }}
                      />
                      <SpkButton
                        Buttonvariant="primary"
                        Customclass="btn-sm"
                        onClickfunc={handleAddHocham}
                      >
                        <i className="ri-add-line me-1"></i>Thêm Học hàm
                      </SpkButton>
                    </div>

                    {hochamLoading ? (
                      <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <Table className="table text-nowrap" hover>
                          <thead>
                            <tr>
                              <th className="bg-light" style={{ width: '5%' }}>STT</th>
                              <th className="bg-light" style={{ width: '20%' }}>Mã học hàm</th>
                              <th className="bg-light" style={{ width: '30%' }}>Tên học hàm</th>
                              <th className="bg-light" style={{ width: '30%' }}>Mô tả</th>
                              <th className="bg-light text-center" style={{ width: '15%' }}>Thao tác</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredHocham.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="text-center py-4 text-muted">
                                  Chưa có học hàm nào
                                </td>
                              </tr>
                            ) : (
                              filteredHocham.map((item, index) => (
                                <tr key={item.maHocHam}>
                                  <td>{index + 1}</td>
                                  <td>
                                    <Badge bg="primary-transparent">{item.maHocHam}</Badge>
                                  </td>
                                  <td className="fw-semibold">{item.tenHocHam}</td>
                                  <td className="text-muted">{item.moTa || <span className="fst-italic">Chưa có</span>}</td>
                                  <td className="text-center">
                                    <div className="btn-group btn-group-sm">
                                      <Button variant="info-transparent" size="sm" onClick={() => handleEditHocham(item)}>
                                        <i className="ri-edit-line"></i>
                                      </Button>
                                      <Button variant="danger-transparent" size="sm" onClick={() => handleDeleteHocham(item.maHocHam)}>
                                        <i className="ri-delete-bin-line"></i>
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </Table>
                      </div>
                    )}
                  </Tab.Pane>

                  {/* Học vị Tab */}
                  <Tab.Pane eventKey="hocvi">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Tìm kiếm học vị..."
                        value={hocviSearch}
                        onChange={(e) => setHocviSearch(e.target.value)}
                        style={{ maxWidth: '300px' }}
                      />
                      <SpkButton
                        Buttonvariant="success"
                        Customclass="btn-sm"
                        onClickfunc={handleAddHocvi}
                      >
                        <i className="ri-add-line me-1"></i>Thêm Học vị
                      </SpkButton>
                    </div>

                    {hocviLoading ? (
                      <div className="text-center py-5">
                        <Spinner animation="border" variant="success" />
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <Table className="table text-nowrap" hover>
                          <thead>
                            <tr>
                              <th className="bg-light" style={{ width: '5%' }}>STT</th>
                              <th className="bg-light" style={{ width: '20%' }}>Mã học vị</th>
                              <th className="bg-light" style={{ width: '30%' }}>Tên học vị</th>
                              <th className="bg-light" style={{ width: '30%' }}>Mô tả</th>
                              <th className="bg-light text-center" style={{ width: '15%' }}>Thao tác</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredHocvi.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="text-center py-4 text-muted">
                                  Chưa có học vị nào
                                </td>
                              </tr>
                            ) : (
                              filteredHocvi.map((item, index) => (
                                <tr key={item.maHocVi}>
                                  <td>{index + 1}</td>
                                  <td>
                                    <Badge bg="success-transparent">{item.maHocVi}</Badge>
                                  </td>
                                  <td className="fw-semibold">{item.tenHocVi}</td>
                                  <td className="text-muted">{item.moTa || <span className="fst-italic">Chưa có</span>}</td>
                                  <td className="text-center">
                                    <div className="btn-group btn-group-sm">
                                      <Button variant="info-transparent" size="sm" onClick={() => handleEditHocvi(item)}>
                                        <i className="ri-edit-line"></i>
                                      </Button>
                                      <Button variant="danger-transparent" size="sm" onClick={() => handleDeleteHocvi(item.maHocVi)}>
                                        <i className="ri-delete-bin-line"></i>
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </Table>
                      </div>
                    )}
                  </Tab.Pane>
                </Tab.Content>
              </Card.Body>
            </Tab.Container>
          </Card>
        </Col>
      </Row>

      {/* Form Modal for Học hàm */}
      <Modal show={showHochamForm} onHide={() => setShowHochamForm(false)} centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className={`ri-${editingHocham ? 'edit' : 'add'}-line me-2`}></i>
            {editingHocham ? 'Chỉnh sửa' : 'Thêm'} Học hàm
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitHocham}>
          <Modal.Body>
            {submitError && (
              <Alert variant="danger" dismissible onClose={() => setSubmitError(null)}>
                {submitError}
              </Alert>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Mã học hàm <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                value={formData.ma}
                onChange={(e) => setFormData({ ...formData, ma: e.target.value })}
                isInvalid={formErrors.ma}
                disabled={!!editingHocham}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tên học hàm <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                value={formData.ten}
                onChange={(e) => setFormData({ ...formData, ten: e.target.value })}
                isInvalid={formErrors.ten}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.moTa}
                onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setShowHochamForm(false)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : editingHocham ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Form Modal for Học vị */}
      <Modal show={showHocviForm} onHide={() => setShowHocviForm(false)} centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>
            <i className={`ri-${editingHocvi ? 'edit' : 'add'}-line me-2`}></i>
            {editingHocvi ? 'Chỉnh sửa' : 'Thêm'} Học vị
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitHocvi}>
          <Modal.Body>
            {submitError && (
              <Alert variant="danger" dismissible onClose={() => setSubmitError(null)}>
                {submitError}
              </Alert>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Mã học vị <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                value={formData.ma}
                onChange={(e) => setFormData({ ...formData, ma: e.target.value })}
                isInvalid={formErrors.ma}
                disabled={!!editingHocvi}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tên học vị <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                value={formData.ten}
                onChange={(e) => setFormData({ ...formData, ten: e.target.value })}
                isInvalid={formErrors.ten}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.moTa}
                onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setShowHocviForm(false)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button variant="success" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : editingHocvi ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Fragment>
  );
};

export default DegreesPage;
