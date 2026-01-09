export const HIGHLIGHT_RULES = {
    LOWEST: 'lowest',
    HIGHEST: 'highest',
    BOOLEAN_TRUE: 'boolean_true',
    NONE: 'none'
};

const commonFields = [
    {
        key: 'price',
        label: 'Price',
        type: 'currency',
        highlight: HIGHLIGHT_RULES.LOWEST,
        getValue: (item) => item.campaignPrice || item.price,
        priority: 1
    },
    {
        key: 'city',
        label: 'Location',
        type: 'text',
        highlight: HIGHLIGHT_RULES.NONE,
        getValue: (item) => item.district ? `${item.district}, ${item.city}` : item.city,
        priority: 100
    }
];

export const comparisonFieldsConfig = {
    VEHICLE: [
        ...commonFields,
        {
            key: 'brand',
            label: 'Brand',
            type: 'enum',
            enumKey: 'carBrands',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 2
        },
        {
            key: 'model',
            label: 'Model',
            type: 'text',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 3
        },
        {
            key: 'year',
            label: 'Year',
            type: 'number',
            highlight: HIGHLIGHT_RULES.HIGHEST,
            priority: 4
        },
        {
            key: 'mileage',
            label: 'Mileage',
            type: 'number',
            suffix: ' km',
            format: 'locale',
            highlight: HIGHLIGHT_RULES.LOWEST,
            priority: 5
        },
        {
            key: 'fuelType',
            label: 'Fuel Type',
            type: 'enum',
            enumKey: 'fuelTypes',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 6
        },
        {
            key: 'gearbox',
            label: 'Gearbox',
            type: 'enum',
            enumKey: 'gearTypes',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 7
        },
        {
            key: 'horsePower',
            label: 'Horse Power',
            type: 'number',
            suffix: ' HP',
            highlight: HIGHLIGHT_RULES.HIGHEST,
            priority: 8
        },
        {
            key: 'engineCapacity',
            label: 'Engine',
            type: 'number',
            suffix: ' cc',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 9
        },
        {
            key: 'drivetrain',
            label: 'Drivetrain',
            type: 'enum',
            enumKey: 'drivetrains',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 10
        },
        {
            key: 'bodyType',
            label: 'Body Type',
            type: 'enum',
            enumKey: 'bodyTypes',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 11
        },
        {
            key: 'color',
            label: 'Color',
            type: 'enum',
            enumKey: 'colors',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 12
        },
        {
            key: 'doors',
            label: 'Doors',
            type: 'enum',
            enumKey: 'doors',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 13
        },
        {
            key: 'seatCount',
            label: 'Seats',
            type: 'enum',
            enumKey: 'seatCounts',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 14
        },
        {
            key: 'accidentHistory',
            label: 'Accident Free',
            type: 'boolean',
            invert: true,
            highlight: HIGHLIGHT_RULES.BOOLEAN_TRUE,
            priority: 15
        },
        {
            key: 'swap',
            label: 'Open to Swap',
            type: 'boolean',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 16
        }
    ],

    ELECTRONICS: [
        ...commonFields,
        {
            key: 'electronicBrand',
            label: 'Brand',
            type: 'enum',
            enumKey: 'electronicBrands',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 2
        },
        {
            key: 'model',
            label: 'Model',
            type: 'text',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 3
        },
        {
            key: 'electronicType',
            label: 'Type',
            type: 'enum',
            enumKey: 'electronicTypes',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 4
        },
        {
            key: 'year',
            label: 'Year',
            type: 'number',
            highlight: HIGHLIGHT_RULES.HIGHEST,
            priority: 5
        },
        {
            key: 'ram',
            label: 'RAM',
            type: 'number',
            suffix: ' GB',
            highlight: HIGHLIGHT_RULES.HIGHEST,
            priority: 6
        },
        {
            key: 'storage',
            label: 'Storage',
            type: 'number',
            suffix: ' GB',
            highlight: HIGHLIGHT_RULES.HIGHEST,
            priority: 7
        },
        {
            key: 'processor',
            label: 'Processor',
            type: 'enum',
            enumKey: 'processors',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 8
        },
        {
            key: 'screenSize',
            label: 'Screen Size',
            type: 'number',
            suffix: '"',
            highlight: HIGHLIGHT_RULES.HIGHEST,
            priority: 9
        },
        {
            key: 'color',
            label: 'Color',
            type: 'enum',
            enumKey: 'colors',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 10
        },
        {
            key: 'warrantyProof',
            label: 'Warranty',
            type: 'boolean',
            highlight: HIGHLIGHT_RULES.BOOLEAN_TRUE,
            priority: 11
        },
        {
            key: 'origin',
            label: 'Origin',
            type: 'text',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 12
        }
    ],

    CLOTHING: [
        ...commonFields,
        {
            key: 'brand',
            label: 'Brand',
            type: 'enum',
            enumKey: 'clothingBrands',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 2
        },
        {
            key: 'clothingType',
            label: 'Type',
            type: 'enum',
            enumKey: 'clothingTypes',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 3
        },
        {
            key: 'clothingCategory',
            label: 'Category',
            type: 'enum',
            enumKey: 'clothingCategories',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 4
        },
        {
            key: 'condition',
            label: 'Condition',
            type: 'enum',
            enumKey: 'clothingConditions',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 5
        },
        {
            key: 'clothingGender',
            label: 'Gender',
            type: 'enum',
            enumKey: 'clothingGenders',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 6
        },
        {
            key: 'color',
            label: 'Color',
            type: 'enum',
            enumKey: 'colors',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 7
        },
        {
            key: 'purchaseDate',
            label: 'Purchase Date',
            type: 'date',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 8
        }
    ],

    BOOKS: [
        ...commonFields,
        {
            key: 'author',
            label: 'Author',
            type: 'text',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 2
        },
        {
            key: 'genre',
            label: 'Genre',
            type: 'enum',
            enumKey: 'bookGenres',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 3
        },
        {
            key: 'language',
            label: 'Language',
            type: 'enum',
            enumKey: 'bookLanguages',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 4
        },
        {
            key: 'format',
            label: 'Format',
            type: 'enum',
            enumKey: 'bookFormats',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 5
        },
        {
            key: 'condition',
            label: 'Condition',
            type: 'enum',
            enumKey: 'bookConditions',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 6
        },
        {
            key: 'publicationYear',
            label: 'Publication Year',
            type: 'number',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 7
        },
        {
            key: 'pageCount',
            label: 'Pages',
            type: 'number',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 8
        },
        {
            key: 'isbn',
            label: 'ISBN',
            type: 'text',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 9
        }
    ],

    SPORTS: [
        ...commonFields,
        {
            key: 'discipline',
            label: 'Sport',
            type: 'enum',
            enumKey: 'sportDisciplines',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 2
        },
        {
            key: 'equipmentType',
            label: 'Equipment Type',
            type: 'enum',
            enumKey: 'sportEquipmentTypes',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 3
        },
        {
            key: 'condition',
            label: 'Condition',
            type: 'enum',
            enumKey: 'sportConditions',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 4
        }
    ],

    REAL_ESTATE: [
        ...commonFields,
        {
            key: 'adType',
            label: 'Ad Type',
            type: 'enum',
            enumKey: 'realEstateAdTypes',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 2
        },
        {
            key: 'realEstateType',
            label: 'Property Type',
            type: 'enum',
            enumKey: 'realEstateTypes',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 3
        },
        {
            key: 'squareMeters',
            label: 'Area',
            type: 'number',
            suffix: ' m²',
            highlight: HIGHLIGHT_RULES.HIGHEST,
            priority: 4
        },
        {
            key: 'roomCount',
            label: 'Rooms',
            type: 'number',
            highlight: HIGHLIGHT_RULES.HIGHEST,
            priority: 5
        },
        {
            key: 'bathroomCount',
            label: 'Bathrooms',
            type: 'number',
            highlight: HIGHLIGHT_RULES.HIGHEST,
            priority: 6
        },
        {
            key: 'floor',
            label: 'Floor',
            type: 'number',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 7
        },
        {
            key: 'buildingAge',
            label: 'Building Age',
            type: 'number',
            suffix: ' years',
            highlight: HIGHLIGHT_RULES.LOWEST,
            priority: 8
        },
        {
            key: 'heatingType',
            label: 'Heating',
            type: 'enum',
            enumKey: 'heatingTypes',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 9
        },
        {
            key: 'ownerType',
            label: 'Owner Type',
            type: 'enum',
            enumKey: 'listingOwnerTypes',
            highlight: HIGHLIGHT_RULES.NONE,
            priority: 10
        },
        {
            key: 'furnished',
            label: 'Furnished',
            type: 'boolean',
            highlight: HIGHLIGHT_RULES.BOOLEAN_TRUE,
            priority: 11
        }
    ]
};

export const getFieldsForCategory = (category) => {
    const fields = comparisonFieldsConfig[category] || [];
    return [...fields].sort((a, b) => a.priority - b.priority);
};

export const calculateHighlights = (items, fields) => {
    const highlights = {};

    fields.forEach(field => {
        if (field.highlight === HIGHLIGHT_RULES.NONE) return;

        const values = items.map(item => {
            const value = field.getValue ? field.getValue(item) : item[field.key];
            if (field.type === 'currency' || field.type === 'number') {
                return parseFloat(value) || null;
            }
            if (field.type === 'boolean') {
                const boolValue = field.invert ? !value : value;
                return boolValue === true;
            }
            return value;
        });

        const numericValues = values.filter(v => v !== null && typeof v === 'number');

        if (field.highlight === HIGHLIGHT_RULES.LOWEST && numericValues.length > 0) {
            const minValue = Math.min(...numericValues);
            highlights[field.key] = items
                .map((item, idx) => values[idx] === minValue ? item.id : null)
                .filter(Boolean);
        }

        if (field.highlight === HIGHLIGHT_RULES.HIGHEST && numericValues.length > 0) {
            const maxValue = Math.max(...numericValues);
            highlights[field.key] = items
                .map((item, idx) => values[idx] === maxValue ? item.id : null)
                .filter(Boolean);
        }

        if (field.highlight === HIGHLIGHT_RULES.BOOLEAN_TRUE) {
            highlights[field.key] = items
                .map((item, idx) => values[idx] === true ? item.id : null)
                .filter(Boolean);
        }
    });

    return highlights;
};

