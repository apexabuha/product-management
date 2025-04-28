$(document).ready(function() {
    let deleteIndex = null;
    let dataTable = null;

    // Configure toastr
    toastr.options = {
        closeButton: true,
        progressBar: true,
        positionClass: "toast-top-right",
        timeOut: 3000,
        extendedTimeOut: 1000,
        preventDuplicates: true,
        newestOnTop: true,
        showMethod: "fadeIn",
        hideMethod: "fadeOut",
        closeMethod: "fadeOut",
        tapToDismiss: false,
        rtl: false,
        theme: document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'dark' : 'light'
    };

    // Function to format number with commas
    function formatNumber(num) {
        return parseFloat(num).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // Function to format date
    function formatDate(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return '';
            }
    
            const options = {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            };
    
            return date.toLocaleString('en-US', options);
        } catch (e) {
            console.error('Error formatting date:', e);
            return '';
        }
    }

    // Add custom validation method for product name pattern
    $.validator.addMethod("productNamePattern", function(value, element) {
        return this.optional(element) || /^[a-zA-Z0-9\s\-_]+$/.test(value);
    }, "Product name can only contain letters, numbers, spaces, hyphens, and underscores");

    // Load products function
    function loadProducts() {
        $.ajax({
            url: '/products',
            method: 'GET',
            success: function(products) {
                let totalSum = 0;
                let tableData = [];
                
                products.forEach((product, index) => {
                    totalSum += parseFloat(product.total_value);
                    tableData.push([
                        product.product_name,
                        formatNumber(product.quantity),
                        '$' + formatNumber(product.price),
                        formatDate(product.created_at),
                        '$' + formatNumber(product.total_value),
                        `<button class="btn btn-sm btn-primary edit-btn" data-id="${product.id}">Edit</button>
                         <button class="btn btn-sm btn-danger delete-btn" data-id="${product.id}" data-name="${product.product_name}">Delete</button>`
                    ]);
                });

                if (dataTable) {
                    dataTable.clear().rows.add(tableData).draw();
                } else {
                    $('#productsTable tbody').empty();
                    tableData.forEach(row => {
                        $('#productsTable tbody').append(`<tr><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td><td>${row[4]}</td><td>${row[5]}</td></tr>`);
                    });
                    initializeDataTable();
                }

                $('#totalSum').text('$' + formatNumber(totalSum));
            }
        });
    }

    // Initialize DataTable
    function initializeDataTable() {
        if (dataTable) {
            dataTable.destroy();
        }

        dataTable = $('#productsTable').DataTable({
            pageLength: 10,
            order: [[3, 'desc']],
            columnDefs: [
                { targets: [1, 2, 4], className: 'text-end' },
                { targets: 3, className: 'text-center' },
                { targets: 5, orderable: false }
            ],
            language: {
                search: "Search products:"
            }
        });
    }

    // Initialize form validation
    $("#productForm").validate({
        rules: {
            product_name: {
                required: true,
                minlength: 2,
                maxlength: 100,
                productNamePattern: true
            },
            quantity: {
                required: true,
                min: 0,
                max: 999999,
                digits: true
            },
            price: {
                required: true,
                min: 0,
                max: 999999.99,
                number: true
            }
        },
        messages: {
            product_name: {
                required: "Please enter a product name",
                minlength: "Product name must be at least 2 characters long",
                maxlength: "Product name cannot exceed 100 characters"
            },
            quantity: {
                required: "Please enter a quantity",
                min: "Quantity must be at least 0",
                max: "Quantity cannot exceed 999999",
                digits: "Quantity must be a whole number"
            },
            price: {
                required: "Please enter a price",
                min: "Price must be at least 0",
                max: "Price cannot exceed 999999.99",
                number: "Please enter a valid price"
            }
        },
        errorElement: "div",
        errorClass: "invalid-feedback",
        validClass: "valid-feedback",
        highlight: function(element, errorClass, validClass) {
            $(element).addClass("is-invalid").removeClass("is-valid");
        },
        unhighlight: function(element, errorClass, validClass) {
            $(element).addClass("is-valid").removeClass("is-invalid");
        }
    });

    $("#editForm").validate({
        rules: {
            product_name: {
                required: true,
                minlength: 2,
                maxlength: 100,
                productNamePattern: true
            },
            quantity: {
                required: true,
                min: 0,
                max: 999999,
                digits: true
            },
            price: {
                required: true,
                min: 0,
                max: 999999.99,
                number: true
            }
        },
        messages: {
            product_name: {
                required: "Please enter a product name",
                minlength: "Product name must be at least 2 characters long",
                maxlength: "Product name cannot exceed 100 characters"
            },
            quantity: {
                required: "Please enter a quantity",
                min: "Quantity must be at least 0",
                max: "Quantity cannot exceed 999999",
                digits: "Quantity must be a whole number"
            },
            price: {
                required: "Please enter a price",
                min: "Price must be at least 0",
                max: "Price cannot exceed 999999.99",
                number: "Please enter a valid price"
            }
        },
        errorElement: "div",
        errorClass: "invalid-feedback",
        validClass: "valid-feedback",
        highlight: function(element, errorClass, validClass) {
            $(element).addClass("is-invalid").removeClass("is-valid");
        },
        unhighlight: function(element, errorClass, validClass) {
            $(element).addClass("is-valid").removeClass("is-invalid");
        }
    });

    // Load products on page load
    loadProducts();

    // Handle form submission
    $('#saveProduct').on('click', function() {
        if ($("#productForm").valid()) {
            $.ajax({
                url: '/products',
                method: 'POST',
                data: $('#productForm').serialize(),
                success: function(response) {
                    $('#addModal').modal('hide');
                    $("#productForm")[0].reset();
                    $("#productForm").validate().resetForm();
                    loadProducts();
                    toastr.success('Product added successfully!', '', {
                        class: 'toast-success'
                    });
                },
                error: function(xhr) {
                    if (xhr.status === 422) {
                        const errors = xhr.responseJSON.errors;
                        $.each(errors, function(field, messages) {
                            const input = $(`[name="${field}"]`);
                            input.addClass("is-invalid");
                            input.after(`<div class="invalid-feedback">${messages[0]}</div>`);
                        });
                    } else {
                        toastr.error('An error occurred while adding the product.', '', {
                            class: 'toast-error'
                        });
                    }
                }
            });
        }
    });

    // Handle edit button click
    $(document).on('click', '.edit-btn', function() {
        const id = $(this).data('id');
        $.ajax({
            url: '/products',
            method: 'GET',
            success: function(products) {
                const product = products.find(p => p.id == id);
                if (product) {
                    $('#editIndex').val(id);
                    $('#edit_product_name').val(product.product_name);
                    $('#edit_quantity').val(product.quantity);
                    $('#edit_price').val(product.price);
                    $('#editModal').modal('show');
                }
            }
        });
    });

    // Handle save edit
    $('#saveEdit').on('click', function() {
        if ($("#editForm").valid()) {
            const id = $('#editIndex').val();
            $.ajax({
                url: `/products/${id}`,
                method: 'PUT',
                data: $('#editForm').serialize(),
                success: function(response) {
                    $('#editModal').modal('hide');
                    $("#editForm")[0].reset();
                    $("#editForm").validate().resetForm();
                    loadProducts();
                    toastr.success('Product updated successfully!', '', {
                        class: 'toast-success'
                    });
                },
                error: function(xhr) {
                    if (xhr.status === 422) {
                        const errors = xhr.responseJSON.errors;
                        $.each(errors, function(field, messages) {
                            const input = $(`[name="${field}"]`);
                            input.addClass("is-invalid");
                            input.after(`<div class="invalid-feedback">${messages[0]}</div>`);
                        });
                    } else {
                        toastr.error('An error occurred while updating the product.', '', {
                            class: 'toast-error'
                        });
                    }
                }
            });
        }
    });

    // Handle delete button click
    $(document).on('click', '.delete-btn', function() {
        deleteIndex = $(this).data('id');
        const productName = $(this).data('name');
        $('#deleteProductName').text(productName);
        $('#deleteModal').modal('show');
    });

    // Handle confirm delete
    $('#confirmDelete').on('click', function() {
        if (deleteIndex !== null) {
            $.ajax({
                url: `/products/${deleteIndex}`,
                method: 'DELETE',
                success: function(response) {
                    $('#deleteModal').modal('hide');
                    loadProducts();
                    deleteIndex = null;
                    toastr.error('Product deleted successfully!', '', {
                        class: 'toast-error'
                    });
                },
                error: function() {
                    toastr.error('An error occurred while deleting the product.', '', {
                        class: 'toast-error'
                    });
                }
            });
        }
    });

    // Reset form validation when modals are closed
    $('#addModal').on('hidden.bs.modal', function () {
        $("#productForm")[0].reset();
        $("#productForm").validate().resetForm();
    });

    $('#editModal').on('hidden.bs.modal', function () {
        $("#editForm")[0].reset();
        $("#editForm").validate().resetForm();
    });

    // Update toastr theme when theme changes
    $(document).on('themeChanged', function(e, theme) {
        toastr.options.theme = theme === 'dark' ? 'dark' : 'light';
    });
}); 