-- CHECK IF TABLES EXIST
SELECT 
    table_name 
FROM 
    information_schema.tables 
WHERE 
    table_schema = 'public';

-- CHECK IF HOSTEL COLUMNS EXIST
SELECT 
    column_name, data_type 
FROM 
    information_schema.columns 
WHERE 
    table_name = 'hostels';
