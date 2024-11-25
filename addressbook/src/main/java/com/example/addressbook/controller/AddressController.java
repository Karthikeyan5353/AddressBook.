package com.example.addressbook.controller;

import com.example.addressbook.model.Address;
import com.example.addressbook.service.AddressService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {
    private final AddressService service;

    public AddressController(AddressService service) {
        this.service = service;
    }

    @GetMapping
    public List<Address> getAllAddresses() {
        return service.getAllAddresses();
    }

    @PostMapping
    public Address saveAddress(@RequestBody Address address) {
        return service.saveAddress(address);
    }

    @DeleteMapping("/{id}")
    public void deleteAddress(@PathVariable String id) {
        service.deleteAddress(id);
    }
}
