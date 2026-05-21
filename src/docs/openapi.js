const openApiSpec = {
    openapi: '3.0.3',
    info: {
        title: 'ParkSecure Cloud API',
        version: '1.0.0',
        description: 'REST API for ParkSecure cloud administration, access events and reports.'
    },
    servers: [
        {
            url: 'http://localhost:3000/api',
            description: 'Local Docker backend'
        }
    ],
    tags: [
        { name: 'Health' },
        { name: 'Auth' },
        { name: 'Users', description: 'Compatibility API for authentication accounts stored in the accounts table.' },
        { name: 'Divisions' },
        { name: 'Employees' },
        { name: 'Devices' },
        { name: 'Access Events' },
        { name: 'Mobile Compatibility' },
        { name: 'Gate' },
        { name: 'Reports' }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            },
            gateApiKey: {
                type: 'apiKey',
                in: 'header',
                name: 'X-Gate-Api-Key'
            }
        },
        schemas: {
            LoginRequest: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', example: 'admin@parksecure.local' },
                    password: { type: 'string', example: 'admin123' }
                }
            },
            Account: {
                type: 'object',
                properties: {
                    accountId: { type: 'integer', example: 1 },
                    email: { type: 'string', example: 'manager@parksecure.local' },
                    role: {
                        type: 'string',
                        enum: ['admin', 'hr', 'division_manager', 'operator', 'viewer'],
                        example: 'division_manager'
                    },
                    divisionId: { type: 'integer', nullable: true, example: 1 },
                    employeeId: { type: 'integer', nullable: true, example: 1 },
                    isActive: { type: 'boolean', example: true },
                    createdAt: { type: 'string', format: 'date-time' }
                }
            },
            AccountCreateRequest: {
                type: 'object',
                required: ['email', 'password', 'role'],
                properties: {
                    email: { type: 'string', example: 'manager@parksecure.local' },
                    password: { type: 'string', example: 'manager123' },
                    role: {
                        type: 'string',
                        enum: ['admin', 'hr', 'division_manager', 'operator', 'viewer'],
                        example: 'division_manager'
                    },
                    divisionId: { type: 'integer', nullable: true, example: 1 },
                    employeeId: { type: 'integer', nullable: true, example: 1 },
                    isActive: { type: 'boolean', example: true }
                }
            },
            AccountUpdateRequest: {
                type: 'object',
                properties: {
                    email: { type: 'string', example: 'operator@parksecure.local' },
                    password: { type: 'string', example: 'new-password' },
                    role: {
                        type: 'string',
                        enum: ['admin', 'hr', 'division_manager', 'operator', 'viewer'],
                        example: 'operator'
                    },
                    divisionId: { type: 'integer', nullable: true, example: 1 },
                    employeeId: { type: 'integer', nullable: true, example: 1 },
                    isActive: { type: 'boolean', example: true }
                }
            },
            DivisionCreateRequest: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: { type: 'string', example: 'Central Division' }
                }
            },
            EmployeeCreateRequest: {
                type: 'object',
                required: ['firstName', 'lastName', 'cnp', 'divisionId'],
                properties: {
                    firstName: { type: 'string', example: 'Ion' },
                    lastName: { type: 'string', example: 'Popescu' },
                    cnp: { type: 'string', example: '1990101123456' },
                    photoUrl: { type: 'string', nullable: true, example: 'https://example.com/photo.jpg' },
                    badgeCode: { type: 'string', nullable: true, example: 'EMP001' },
                    divisionId: { type: 'integer', example: 1 },
                    bluetoothCode: { type: 'string', nullable: true, example: 'BT-ION-001' },
                    carNumber: { type: 'string', nullable: true, example: 'TM01ABC' },
                    accessStartTime: { type: 'string', nullable: true, example: '08:00' },
                    accessEndTime: { type: 'string', nullable: true, example: '18:00' },
                    isActive: { type: 'boolean', example: true }
                }
            },
            EmployeeToggleRequest: {
                type: 'object',
                required: ['isActive'],
                properties: {
                    isActive: { type: 'boolean', example: false }
                }
            },
            DeviceRegisterRequest: {
                type: 'object',
                required: ['employeeId', 'platform', 'deviceIdentifier'],
                properties: {
                    employeeId: { type: 'integer', example: 1 },
                    platform: { type: 'string', example: 'Android' },
                    deviceIdentifier: { type: 'string', example: 'android-device-unique-id' },
                    isTrusted: { type: 'boolean', example: true }
                }
            },
            DeviceRegisterResponse: {
                type: 'object',
                properties: {
                    smartphoneId: { type: 'integer', example: 1 },
                    employeeId: { type: 'integer', example: 1 },
                    platform: { type: 'string', example: 'Android' },
                    deviceIdentifier: { type: 'string', example: 'android-device-unique-id' },
                    accessSeed: {
                        type: 'string',
                        description: 'Secret seed generated by cloud for the mobile app. Returned only when the device is registered or re-registered.',
                        example: '4D7C4F6F1B2A4E6D8C9A0B1C2D3E4F506172839405A6B7C8D9E0F11223344556'
                    },
                    isTrusted: { type: 'boolean', example: true },
                    registeredAt: { type: 'string', format: 'date-time' }
                }
            },
            AccessEventRequest: {
                type: 'object',
                required: ['employeeId', 'eventType', 'eventStatus'],
                properties: {
                    employeeId: { type: 'integer', example: 1 },
                    smartphoneId: { type: 'integer', nullable: true, example: 1 },
                    eventType: { type: 'string', enum: ['ENTRY', 'EXIT'], example: 'ENTRY' },
                    eventStatus: { type: 'string', enum: ['ALLOWED', 'DENIED'], example: 'ALLOWED' },
                    eventTime: { type: 'string', format: 'date-time', nullable: true },
                    gateCode: { type: 'string', nullable: true, example: 'GATE-1' },
                    source: { type: 'string', example: 'esp32' },
                    notes: { type: 'string', nullable: true, example: 'Access granted by Bluetooth validation' }
                }
            },
            AccessSeedValidationRequest: {
                type: 'object',
                required: ['accessSeed', 'eventType'],
                properties: {
                    accessSeed: {
                        type: 'string',
                        example: '4D7C4F6F1B2A4E6D8C9A0B1C2D3E4F506172839405A6B7C8D9E0F11223344556'
                    },
                    eventType: { type: 'string', enum: ['ENTRY', 'EXIT'], example: 'ENTRY' },
                    gateCode: { type: 'string', nullable: true, example: 'GATE-01' }
                }
            },
            MobileLoginSecureRequest: {
                type: 'object',
                required: ['email', 'password', 'deviceIdentifier'],
                properties: {
                    email: { type: 'string', example: 'manager.demo@parksecure.local' },
                    password: { type: 'string', example: 'admin123' },
                    platform: { type: 'string', nullable: true, example: 'ios' },
                    deviceIdentifier: { type: 'string', example: 'ios-hw-12345' }
                }
            },
            MobileValidateAccessRequest: {
                type: 'object',
                required: ['accessSeed'],
                properties: {
                    accessSeed: {
                        type: 'string',
                        example: '4D7C4F6F1B2A4E6D8C9A0B1C2D3E4F506172839405A6B7C8D9E0F11223344556'
                    }
                }
            },
            GateAccessListItem: {
                type: 'object',
                properties: {
                    employeeId: { type: 'integer', example: 1 },
                    firstName: { type: 'string', example: 'Ion' },
                    lastName: { type: 'string', example: 'Popescu' },
                    divisionId: { type: 'integer', example: 1 },
                    divisionName: { type: 'string', example: 'Central Division' },
                    bluetoothCode: { type: 'string', nullable: true, example: 'BT-ION-001' },
                    carNumber: { type: 'string', nullable: true, example: 'TM01ABC' },
                    accessStartTime: { type: 'string', nullable: true, example: '08:00:00' },
                    accessEndTime: { type: 'string', nullable: true, example: '18:00:00' },
                    smartphone: {
                        type: 'object',
                        nullable: true,
                        properties: {
                            smartphoneId: { type: 'integer', example: 1 },
                            platform: { type: 'string', example: 'android' },
                            deviceIdentifier: { type: 'string', example: 'android-device-unique-id' },
                            accessSeed: {
                                type: 'string',
                                description: 'Secret credential for local gate/mobile validation. Exposed only to the gate sync endpoint.',
                                example: '4D7C4F6F1B2A4E6D8C9A0B1C2D3E4F506172839405A6B7C8D9E0F11223344556'
                            },
                            isTrusted: { type: 'boolean', example: true },
                            registeredAt: { type: 'string', format: 'date-time' }
                        }
                    }
                }
            },
            ApiResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    data: { nullable: true }
                }
            },
            ErrorResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string' },
                    error: { type: 'string' }
                }
            }
        },
        responses: {
            Unauthorized: {
                description: 'Authentication token is missing, invalid or expired',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ErrorResponse' }
                    }
                }
            },
            Forbidden: {
                description: 'Authenticated user does not have permission',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ErrorResponse' }
                    }
                }
            }
        }
    },
    paths: {
        '/health': {
            get: {
                tags: ['Health'],
                summary: 'Check if the API is running',
                responses: {
                    200: { description: 'API is running' }
                }
            }
        },
        '/db-test': {
            get: {
                tags: ['Health'],
                summary: 'Check PostgreSQL connectivity',
                responses: {
                    200: { description: 'Database connection works' },
                    500: { description: 'Database connection failed' }
                }
            }
        },
        '/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Login and receive a JWT',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/LoginRequest' }
                        }
                    }
                },
                responses: {
                    200: { description: 'Login successful' },
                    401: { description: 'Invalid credentials' }
                }
            }
        },
        '/users': {
            get: {
                tags: ['Users'],
                summary: 'List accounts',
                description: 'External endpoint kept as /api/users for frontend compatibility. Internally these records are stored in the accounts table.',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Accounts list' },
                    401: { $ref: '#/components/responses/Unauthorized' },
                    403: { $ref: '#/components/responses/Forbidden' }
                }
            },
            post: {
                tags: ['Users'],
                summary: 'Create an account',
                description: 'Admin can create any role. HR can create only division_manager, operator or viewer accounts. employeeId is optional, but one employee can be linked to only one account.',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AccountCreateRequest' }
                        }
                    }
                },
                responses: {
                    201: { description: 'Account created' },
                    401: { $ref: '#/components/responses/Unauthorized' },
                    403: { $ref: '#/components/responses/Forbidden' }
                }
            }
        },
        '/users/{id}': {
            put: {
                tags: ['Users'],
                summary: 'Update an account',
                description: 'Admin can update any account. HR can update only non-admin and non-hr accounts, and cannot assign admin or hr roles.',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AccountUpdateRequest' }
                        }
                    }
                },
                responses: {
                    200: { description: 'Account updated' },
                    401: { $ref: '#/components/responses/Unauthorized' },
                    403: { $ref: '#/components/responses/Forbidden' },
                    404: { description: 'Account not found' }
                }
            }
        },
        '/admin/users/{id}': {
            delete: {
                tags: ['Users'],
                summary: 'Delete an account permanently',
                description: 'Hard delete for maintenance. Admin only. The currently authenticated account cannot delete itself.',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: {
                    200: { description: 'Account deleted' },
                    401: { $ref: '#/components/responses/Unauthorized' },
                    403: { $ref: '#/components/responses/Forbidden' },
                    404: { description: 'Account not found' }
                }
            }
        },
        '/divisions': {
            get: {
                tags: ['Divisions'],
                summary: 'List divisions',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Divisions list' },
                    401: { $ref: '#/components/responses/Unauthorized' }
                }
            },
            post: {
                tags: ['Divisions'],
                summary: 'Create a division',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/DivisionCreateRequest' }
                        }
                    }
                },
                responses: {
                    201: { description: 'Division created' },
                    401: { $ref: '#/components/responses/Unauthorized' },
                    403: { $ref: '#/components/responses/Forbidden' }
                }
            }
        },
        '/employees': {
            get: {
                tags: ['Employees'],
                summary: 'List employees visible to the authenticated user',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Employees list' },
                    401: { $ref: '#/components/responses/Unauthorized' }
                }
            },
            post: {
                tags: ['Employees'],
                summary: 'Create an employee',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/EmployeeCreateRequest' }
                        }
                    }
                },
                responses: {
                    201: { description: 'Employee created' },
                    401: { $ref: '#/components/responses/Unauthorized' },
                    403: { $ref: '#/components/responses/Forbidden' }
                }
            }
        },
        '/employees/{id}': {
            get: {
                tags: ['Employees'],
                summary: 'Get an employee by id',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: {
                    200: { description: 'Employee details' },
                    404: { description: 'Employee not found' }
                }
            },
            put: {
                tags: ['Employees'],
                summary: 'Update an employee',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/EmployeeCreateRequest' }
                        }
                    }
                },
                responses: {
                    200: { description: 'Employee updated' },
                    404: { description: 'Employee not found' }
                }
            }
        },
        '/employees/{id}/toggle-access': {
            patch: {
                tags: ['Employees'],
                summary: 'Activate or deactivate employee access',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/EmployeeToggleRequest' }
                        }
                    }
                },
                responses: {
                    200: { description: 'Access status changed' },
                    404: { description: 'Employee not found' }
                }
            }
        },
        '/devices/register': {
            post: {
                tags: ['Devices'],
                summary: 'Register or replace an employee smartphone and generate an access seed',
                description: 'Creates or replaces the smartphone associated with an employee. The cloud generates accessSeed for the mobile app; access validation remains local to the mobile/gate flow, while cloud stores device metadata and access events.',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/DeviceRegisterRequest' }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Device registered. accessSeed is returned in this response only.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        data: { $ref: '#/components/schemas/DeviceRegisterResponse' }
                                    }
                                }
                            }
                        }
                    },
                    404: { description: 'Employee not found' }
                }
            }
        },
        '/devices/{employeeId}': {
            get: {
                tags: ['Devices'],
                summary: 'Get the smartphone associated with an employee',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'employeeId', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: {
                    200: { description: 'Device details' },
                    404: { description: 'Device not found' }
                }
            }
        },
        '/access-events': {
            get: {
                tags: ['Access Events'],
                summary: 'List access events',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'employeeId', in: 'query', schema: { type: 'integer' } },
                    { name: 'divisionId', in: 'query', schema: { type: 'integer' } },
                    { name: 'eventType', in: 'query', schema: { type: 'string', enum: ['ENTRY', 'EXIT'] } },
                    { name: 'from', in: 'query', schema: { type: 'string', format: 'date-time' } },
                    { name: 'to', in: 'query', schema: { type: 'string', format: 'date-time' } }
                ],
                responses: {
                    200: { description: 'Access events list' },
                    401: { $ref: '#/components/responses/Unauthorized' }
                }
            },
            post: {
                tags: ['Access Events'],
                summary: 'Create an access event from the gate or an authenticated user',
                security: [{ gateApiKey: [] }, { bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AccessEventRequest' }
                        }
                    }
                },
                responses: {
                    201: { description: 'Access event created' },
                    401: { $ref: '#/components/responses/Unauthorized' }
                }
            }
        },
        '/access/validate-seed': {
            post: {
                tags: ['Access Events'],
                summary: 'Validate a mobile access seed for gate demo flow',
                description: 'Demo endpoint for ESP32/gate. It checks accessSeed against smartphones, verifies trusted smartphone, active employee and access interval, then writes an access event for matched seeds. Invalid unknown seeds return DENIED without an access_events row because employee_id is unknown.',
                security: [{ gateApiKey: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AccessSeedValidationRequest' }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Validation result',
                        content: {
                            'application/json': {
                                schema: {
                                    oneOf: [
                                        {
                                            type: 'object',
                                            properties: {
                                                success: { type: 'boolean', example: true },
                                                status: { type: 'string', example: 'ALLOWED' },
                                                employee: {
                                                    type: 'object',
                                                    properties: {
                                                        employeeId: { type: 'integer', example: 1 },
                                                        firstName: { type: 'string', example: 'Ana' },
                                                        lastName: { type: 'string', example: 'Popescu' },
                                                        carNumber: { type: 'string', nullable: true, example: 'TM01ABC' }
                                                    }
                                                }
                                            }
                                        },
                                        {
                                            type: 'object',
                                            properties: {
                                                success: { type: 'boolean', example: false },
                                                status: { type: 'string', example: 'DENIED' },
                                                message: { type: 'string', example: 'Invalid access seed' }
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    },
                    400: { description: 'Invalid request body' },
                    401: { $ref: '#/components/responses/Unauthorized' }
                }
            }
        },
        '/mobile/login-secure': {
            post: {
                tags: ['Mobile Compatibility'],
                summary: 'Mobile demo login and smartphone session registration',
                description: 'Compatibility endpoint for the mobile prototype. It authenticates an account linked to an employee, replaces the previous smartphone session for that employee/device and returns accessSeed.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/MobileLoginSecureRequest' }
                        }
                    }
                },
                responses: {
                    200: { description: 'Mobile session created and accessSeed returned' },
                    400: { description: 'Invalid request body' },
                    401: { description: 'Invalid credentials' },
                    403: { description: 'Inactive account or employee' }
                }
            }
        },
        '/validate-access': {
            post: {
                tags: ['Mobile Compatibility'],
                summary: 'Validate mobile accessSeed with mobile-compatible response',
                description: 'Compatibility endpoint for the mobile prototype. Internally uses the same seed validation logic as /api/access/validate-seed with ENTRY and GATE_MAIN.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/MobileValidateAccessRequest' }
                        }
                    }
                },
                responses: {
                    200: { description: 'Access allowed' },
                    400: { description: 'Missing accessSeed' },
                    403: { description: 'Access denied' }
                }
            }
        },
        '/gate/access-list': {
            get: {
                tags: ['Gate'],
                summary: 'Synchronize active access credentials for ESP32/gate local validation',
                description: 'Returns active employees and trusted smartphone credentials needed by the gate for local validation. This endpoint requires X-Gate-Api-Key and is not meant for the web UI.',
                security: [{ gateApiKey: [] }],
                responses: {
                    200: {
                        description: 'Gate access list',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                generatedAt: { type: 'string', format: 'date-time' },
                                                items: {
                                                    type: 'array',
                                                    items: { $ref: '#/components/schemas/GateAccessListItem' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    401: { $ref: '#/components/responses/Unauthorized' }
                }
            }
        },
        '/reports/individual/{employeeId}': {
            get: {
                tags: ['Reports'],
                summary: 'Generate an individual employee report',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'employeeId', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: { 200: { description: 'Individual report' } }
            }
        },
        '/reports/division/{divisionId}': {
            get: {
                tags: ['Reports'],
                summary: 'Generate a division report',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'divisionId', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: { 200: { description: 'Division report' } }
            }
        },
        '/reports/global': {
            get: {
                tags: ['Reports'],
                summary: 'Generate a global report',
                security: [{ bearerAuth: [] }],
                responses: { 200: { description: 'Global report' } }
            }
        }
    }
};

module.exports = openApiSpec;
